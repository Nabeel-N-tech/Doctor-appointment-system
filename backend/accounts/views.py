from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Appointment, Notification, LabReport, Referral
from .serializers import LabReportSerializer, UserSerializer, AppointmentSerializer
from django.core.mail import send_mail
import random
import stripe
from django.conf import settings
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

stripe.api_key = settings.STRIPE_SECRET_KEY

User = get_user_model()

ALLOWED_ROLES = ["admin", "doctor", "patient"]


@api_view(["POST"])
@permission_classes([AllowAny])   # Anyone can sign up without being logged in
def register(request):
    # Retrieve the serializer to validate the user's input
    from .serializers import RegisterSerializer 
    
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "Patient registered successfully"}, status=201)
    
    return Response(serializer.errors, status=400)

# Admin only user verification/creation
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)
        
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    role = request.data.get("role")
    specialization = request.data.get("specialization") # For doctors
    
    if not all([username, password, email, role]):
        return Response({"error": "All fields required"}, status=400)
        
    if role not in ["doctor", "admin", "patient", "staff"]:
        return Response({"error": "Invalid role"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    if role == "doctor":
        user.specialization = specialization
    user.save()

    return Response({"message": f"{role.capitalize()} user created successfully"}, status=201)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)
    
    try:
        user_to_delete = User.objects.get(id=user_id)
        # Prevent admin from deleting themselves
        if user_to_delete.id == request.user.id:
             return Response({"error": "Cannot delete your own account"}, status=400)
        user_to_delete.delete()
        return Response({"message": "User deleted successfully"}, status=200)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)
        
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    email = request.data.get("email")
    role = request.data.get("role")
    password = request.data.get("password")
    specialization = request.data.get("specialization")
    
    if email and email != user.email:
        if User.objects.filter(email=email).exclude(id=user_id).exists():
            return Response({"error": "Email already in use"}, status=400)
        user.email = email
        Notification.objects.create(
            recipient=user,
            message=f"Your account email has been updated by an administrator."
        )

    if role and role != user.role:
        if user.id == request.user.id:
             return Response({"error": "Cannot change your own role"}, status=400)
        if role in ["doctor", "admin", "patient", "staff"]:
            old_role = user.role
            user.role = role
            Notification.objects.create(
                recipient=user,
                message=f"Your account role has been changed from {old_role} to {role}."
            )
            
    if specialization is not None and user.role == "doctor":
        user.specialization = specialization

    if password:
        user.set_password(password)
        Notification.objects.create(
            recipient=user,
            message=f"Your password has been reset by an administrator."
        )
        
    user.save()
    return Response({"message": "User updated successfully"})

from rest_framework.parsers import JSONParser
from rest_framework.decorators import parser_classes

@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([JSONParser])
def login(request):
    try:
        data = request.data
        print(f"DEBUG LOGIN: Data Type: {type(data)}")
        print(f"DEBUG LOGIN: Data Content: {data}")

        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except Exception as e:
                print(f"DEBUG LOGIN: JSON parsing failed: {e}")
        
        if not isinstance(data, dict):
             # Try to recover info from request.POST if it exists
             if request.POST:
                 data = request.POST
             else:
                 return Response({"error": f"Invalid request format: {type(data)}. Expected JSON."}, status=400)

        username_or_email = data.get("username")
        password = data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Username and password are required"}, status=400)

        # Check if input is email
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                username = user_obj.username
            except User.DoesNotExist:
                # If email not found, we can still try purely as username or just fail
                username = username_or_email
        else:
            username = username_or_email

        user = authenticate(username=username, password=password)
        # If authentication fails with the derived username, it returns None
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": user.role,
                "username": user.username
            })
        return Response({"error": "Invalid credentials"}, status=401)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "GET":
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    # Handle Update
    elif request.method in ["PUT", "PATCH"]:
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print(f"DEBUG: Profile update errors: {serializer.errors}")
        return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_appointments(request):
    try:
        user = request.user
        print(f"DEBUG: get_appointments for user {user.username} (role: {user.role})")
        
        if user.role == "patient":
            appointments = Appointment.objects.select_related('patient', 'doctor').filter(patient=user).order_by('-date')
        elif user.role == "doctor":
            appointments = Appointment.objects.select_related('patient', 'doctor').filter(doctor=user).order_by('-date')
        elif user.role in ["admin", "staff"]:
             appointments = Appointment.objects.select_related('patient', 'doctor').all().order_by('-date')
        else:
            return Response([])
    
        # Check if we can iterate
        count = appointments.count()
        print(f"DEBUG: Found {count} appointments")
        
        serializer = AppointmentSerializer(appointments, many=True)
        data = serializer.data
        return Response(data)
    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"CRITICAL ERROR in get_appointments: {error_msg}")
        
        with open("C:/Users/nabee/reactprojectssubmit/final_project/backend/server_errors.log", "a") as f:
            f.write(f"\n--- Error in get_appointments ---\n{error_msg}\n")
            
        return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_doctors(request):
    doctors = User.objects.filter(role="doctor")
    return Response([{"id": d.id, "username": d.username, "specialization": d.specialization or "General Practice", "is_available": d.is_available} for d in doctors])

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_availability(request):
    if request.user.role != "doctor":
        return Response({"error": "Only doctors can toggle availability"}, status=403)
    
    user = request.user
    user.is_available = not user.is_available
    user.save()
    
    status_str = "Available" if user.is_available else "Uncleared/Unavailable"
    return Response({"message": f"Status updated to {status_str}", "is_available": user.is_available})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_users(request):
    print(f"DEBUG: get_users called by {request.user}")
    print(f"DEBUG: Auth header: {request.headers.get('Authorization')}")
    try:
        if request.user.role not in ["admin", "staff", "doctor"]:
            return Response({"error": "Unauthorized"}, status=403)
        users = User.objects.all()
        # Convert user objects into a list of dictionaries (JSON)
        data = [{"id": u.id, "username": u.username, "email": u.email, "role": u.role, "specialization": u.specialization} for u in users]
        return Response(data)
    except Exception as e:
        import traceback
        print(f"ERROR in get_users: {e}")
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def get_user_detail(request, user_id):
    # Allow doctors, admin, staff to see user details. 
    # Patients can only see themselves (or maybe limited info of doctors)
    try:
        user = User.objects.get(id=user_id)
        
        # Access Check for GET
        if request.method == "GET":
             if request.user.role == "patient" and request.user.id != user.id:
                 return Response({"error": "Unauthorized"}, status=403)
             serializer = UserSerializer(user)
             return Response(serializer.data)

        # Handle Update (PUT/PATCH)
        if request.method in ["PUT", "PATCH"]:
            # Only Admin or Doctor can update other users (simplified)
            # Or user updating themselves
            if request.user.id != user.id and request.user.role not in ["admin", "doctor"]:
                return Response({"error": "Unauthorized"}, status=403)
            
            # If Doctor is updating, ensure they are updating a patient? 
            # (Strictly speaking, but let's allow it for flexibility in this app)
            
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
            
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    # Only allow patients to book appointments (Admins might be added later)
    if request.user.role != "patient":
         return Response({"error": "Only patients can book appointments"}, status=403)
         
    # Expected data: doctor_id, date, reason
    data = request.data
    try:
        doctor = User.objects.get(id=data.get("doctor_id"), role="doctor")
    except User.DoesNotExist:
        return Response({"error": "Doctor not found"}, status=404)
        
    # Calculate Token Number (Queue Position)
    # We find how many appointments this doctor has today and add 1
    from django.utils.dateparse import parse_datetime
    appt_date = parse_datetime(data.get("date"))
    
    existing_count = Appointment.objects.filter(
        doctor=doctor, 
        date__year=appt_date.year,
        date__month=appt_date.month,
        date__day=appt_date.day
    ).count()
    
    token = existing_count + 1

    appointment = Appointment.objects.create(
        patient=request.user,
        doctor=doctor,
        date=data.get("date"),
        reason=data.get("reason"),
        status="pending",
        token_number=token
    )

    # Notify Doctor
    Notification.objects.create(
        recipient=doctor,
        message=f"New appointment request from {request.user.username} for {data.get('date')}."
    )

    # Notify Admins
    admins = User.objects.filter(role="admin")
    for admin in admins:
        Notification.objects.create(
            recipient=admin,
            message=f"A new appointment has been booked between {request.user.username} and Dr. {doctor.username}."
        )

    return Response(AppointmentSerializer(appointment).data, status=201)

@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal user existence
        return Response({"message": "If the email exists, a code has been sent."}, status=200)
    
    # Generate 6-digit code
    code = f"{random.randint(100000, 999999)}"
    user.reset_code = code
    user.save()
    
    # Send email
    send_mail(
        subject="Password Reset Code",
        message=f"Your password reset code is: {code}",
        from_email="noreply@hospital.com",
        recipient_list=[email],
        fail_silently=False,
    )
    
    return Response({"message": "Reset code sent to your email"}, status=200)

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    email = request.data.get("email")
    code = request.data.get("code")
    new_password = request.data.get("new_password")
    
    if not all([email, code, new_password]):
        return Response({"error": "Missing fields"}, status=400)
        
    try:
        user = User.objects.get(email=email)
        if user.reset_code == code:
            user.set_password(new_password)
            user.reset_code = "" # Clear code
            user.save()
            return Response({"message": "Password reset successfully"})
        else:
            return Response({"error": "Invalid code"}, status=400)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        data = [{
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in notifications]
        return Response(data)
    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        with open("C:/Users/nabee/reactprojectssubmit/final_project/backend/server_errors.log", "a") as f:
            f.write(f"\n--- Error in get_notifications ---\n{error_msg}\n")
        return Response({"error": str(e)}, status=500)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notif_id):
    try:
        notif = Notification.objects.get(id=notif_id, recipient=request.user)
        notif.is_read = True
        notif.save()
        return Response({"message": "Marked as read"})
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=404)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, pk):
    if request.user.role not in ["admin", "doctor", "staff"]:
        return Response({"error": "Unauthorized"}, status=403)
    
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)
    
    data = request.data
    if isinstance(data, str):
        import json
        try:
            data = json.loads(data)
        except:
            pass
            
    if isinstance(data, str):
         # If it is STILL a string, we cannot process it.
         print(f"DEBUG: update_appointment_status received unparseable string data: {data}")
         # Attempt to fallback to query params if body failed? Or just return error
         return Response({"error": "Invalid JSON format in body"}, status=400)

    status = data.get("status")
    vitals = data.get("vitals")
    diagnosis = data.get("diagnosis")
    decline_reason = data.get("decline_reason")
    
    if status:
        if status not in ["pending", "confirmed", "in_progress", "completed", "cancelled"]:
            return Response({"error": "Invalid status"}, status=400)
        appointment.status = status
        
    if vitals:
        appointment.vitals = vitals
        
    if diagnosis:
        appointment.diagnosis = diagnosis
        
    if decline_reason:
        appointment.decline_reason = decline_reason
        
    appointment.save()
    
    # Notify patient via Notification system
    if status:
        msg = f"Your appointment with Dr. {appointment.doctor.username} has been {status}."
        if status == 'cancelled' and appointment.decline_reason:
            msg += f" Reason: {appointment.decline_reason}"
            
        Notification.objects.create(
            recipient=appointment.patient,
            message=msg
        )

        # Notify Patient via Email
        if appointment.patient.email:
            try:
                subject = f"Appointment Update: {status.title()}"
                
                email_body = f"Dear {appointment.patient.username},\n\n"
                email_body += f"Your appointment with Dr. {appointment.doctor.username} on {appointment.date} has been {status}.\n"
                
                if status == 'cancelled' and appointment.decline_reason:
                    email_body += f"\nReason for cancellation: {appointment.decline_reason}\n"
                
                email_body += "\nPlease check your dashboard for more details.\n\nBest regards,\nHospital Team"
                
                send_mail(
                    subject,
                    email_body,
                    'noreply@hospital.com',
                    [appointment.patient.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send email: {e}")

        # Notify Doctor on Check In
        if status == 'confirmed':
            Notification.objects.create(
                recipient=appointment.doctor,
                message=f"Patient {appointment.patient.username} has checked in and is ready."
            )
    
    return Response(AppointmentSerializer(appointment).data)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_lab_reports(request):
    from django.db.models import Q
    try:
        if request.user.role == "patient":
            reports = LabReport.objects.select_related('patient', 'doctor').filter(patient=request.user).order_by('-date')
        elif request.user.role in ["admin", "staff", "doctor"]:
            # Allow doctors and staff to view all reports for better clinical oversight
            reports = LabReport.objects.select_related('patient', 'doctor').all().order_by('-date')
        else:
            return Response([])

        serializer = LabReportSerializer(reports, many=True)
        return Response(serializer.data)
    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"ERROR in get_lab_reports: {error_msg}")
        with open("C:/Users/nabee/reactprojectssubmit/final_project/backend/server_errors.log", "a") as f:
            f.write(f"\n--- Error in get_lab_reports ---\n{error_msg}\n")
        return Response({"error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_referral(request):
    if request.user.role != "doctor":
        return Response({"error": "Only doctors can create referrals"}, status=403)
        
    patient_id = request.data.get("patient_id")
    to_doctor_id = request.data.get("to_doctor_id")
    reason = request.data.get("reason")
    
    if not all([patient_id, to_doctor_id]):
        return Response({"error": "Patient and target doctor are required"}, status=400)
        
    try:
        patient = User.objects.get(id=patient_id, role="patient")
        to_doctor = User.objects.get(id=to_doctor_id, role="doctor")
        
        # Security: Can only refer patient if you have an appointment with them
        # or if you are the one who ordered their reports
        has_access = Appointment.objects.filter(patient=patient, doctor=request.user).exists() or \
                     LabReport.objects.filter(patient=patient, doctor=request.user).exists()
                     
        if not has_access:
            return Response({"error": "You do not have clinical access to this patient to refer them."}, status=403)

        referral = Referral.objects.create(
            patient=patient,
            from_doctor=request.user,
            to_doctor=to_doctor,
            reason=reason
        )
        
        # Notify the target doctor
        Notification.objects.create(
            recipient=to_doctor,
            message=f"Dr. {request.user.username} has referred patient {patient.username} to you."
        )
        
        return Response({"message": f"Successfully referred {patient.username} to Dr. {to_doctor.username}."}, status=201)
        
    except User.DoesNotExist:
        return Response({"error": "Patient or Doctor not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_lab_report(request):
    if request.user.role not in ["admin", "staff"]:
        return Response({"error": "Unauthorized"}, status=403)
    
    data = request.data
    # Determine if it's a single report or multiple
    items = data.get("reports") if isinstance(data, dict) and "reports" in data else [data]
    
    created_reports = []
    try:
        patient_id = data.get("patient_id") if isinstance(data, dict) else items[0].get("patient_id")
        patient = User.objects.get(id=patient_id, role="patient")
        
        for item in items:
            report = LabReport.objects.create(
                patient=patient,
                test_name=item.get("test_name"),
                result=item.get("result", ""),
                observed_value=item.get("observed_value"),
                unit=item.get("unit"),
                reference_range=item.get("reference_range"),
                specimen_type=item.get("specimen_type", "Serum"),
                testing_method=item.get("testing_method", "Fully Automated Biochemistry Analyzer"),
                clinical_interpretation=item.get("clinical_interpretation", ""),
                status="completed"
            )
            created_reports.append(report)
            
        # Helper to send email for lab reports
        if patient.email:
             try:
                 subject = "New Lab Report Available"
                 message = f"Dear {patient.username},\n\nA new lab report ({items[0].get('test_name', 'Test')}) has been added to your record.\nPlease log in to your dashboard to view the full details.\n\nBest regards,\nHospital Team"
                 send_mail(
                     subject,
                     message,
                     'noreply@hospital.com',
                     [patient.email],
                     fail_silently=True
                 )
             except Exception as e:
                 print(f"Failed to send email: {e}")

        return Response(LabReportSerializer(created_reports, many=True).data, status=201)
    except User.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
        if request.user != appointment.patient:
            return Response({"error": "Unauthorized"}, status=403)
            
        # Hardcoded amount for now: $50.00 (in cents)
        amount = 5000 
        
        if not stripe.api_key:
            print("CRITICAL: STRIPE_SECRET_KEY is missing in backend environment.")
            return Response({"error": "Payment service not configured (Missing Key)"}, status=503)

        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={'appointment_id': appointment.id}
        )
        
        return Response({
            'clientSecret': intent['client_secret']
        })
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_stripe_config(request):
    return Response({'publishableKey': settings.STRIPE_PUBLISHABLE_KEY})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_appointment(request, pk):
    print(f"DEBUG: pay_appointment request for ID {pk} from user {request.user.username}")
    try:
        appointment = Appointment.objects.get(pk=pk)
        if request.user != appointment.patient:
             return Response({"error": "Unauthorized"}, status=403)
        
        # In a real production app, you would verify the specific PaymentIntent status here
        # For this prototype, we trust the client call after Stripe success
        
        # Use update to force specific field write at DB level
        Appointment.objects.filter(pk=pk).update(payment_status='paid')
        
        # Verify update
        app_refresh = Appointment.objects.get(pk=pk)
        print(f"DEBUG: Updated appointment {pk} payment_status to: {app_refresh.payment_status}")
        
        return Response({"message": "Payment successful", "appointment_id": appointment.id, "payment_status": "paid"})
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_my_appointment(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
        
        # Verify ownership
        if request.user != appointment.patient:
            return Response({"error": "Unauthorized"}, status=403)
            
        # Only allow cancelling pending/confirmed, not completed
        if appointment.status == 'completed':
            return Response({"error": "Cannot cancel a completed appointment"}, status=400)
            
        if appointment.status == 'cancelled':
             return Response({"message": "Already cancelled"}, status=200)

        appointment.status = 'cancelled'
        appointment.save()
        
        # Notify Doctor
        Notification.objects.create(
            recipient=appointment.doctor,
            message=f"Appointment with {request.user.username} (Token #{appointment.token_number}) was cancelled by the patient."
        )
        
        return Response({"message": "Appointment cancelled successfully", "status": "cancelled"})
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)

from .models import Prescription
from .serializers import PrescriptionSerializer
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    if request.user.role != "doctor":
        return Response({"error": "Only doctors can prescribe"}, status=403)
        
    data = request.data
    patient_id = data.get("patient_id")
    medicines = data.get("medicines")
    
    if not all([patient_id, medicines]):
        return Response({"error": "Patient and medicines are required"}, status=400)
        
    try:
        patient = User.objects.get(id=patient_id, role="patient")
        appointment_id = data.get("appointment_id")
        appointment = None
        if appointment_id:
            try:
                appointment = Appointment.objects.get(id=appointment_id)
            except Appointment.DoesNotExist:
                pass
                
        prescription = Prescription.objects.create(
            doctor=request.user,
            patient=patient,
            appointment=appointment,
            medicines=medicines,
            notes=data.get("notes", "")
        )
        
        # Notify Staff? (Optional, or just let them see the queue)
        
        return Response(PrescriptionSerializer(prescription).data, status=201)
    except User.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_prescriptions(request):
    user = request.user
    if user.role == "doctor":
        scripts = Prescription.objects.filter(doctor=user).order_by('-date')
    elif user.role == "patient":
        scripts = Prescription.objects.filter(patient=user).order_by('-date')
    elif user.role == "staff":
        # Staff sees all undispensed scripts? Or all?
        # Let's show non-dispensed first
        scripts = Prescription.objects.all().order_by('is_dispensed', '-date')
    else:
        return Response([])
        
    return Response(PrescriptionSerializer(scripts, many=True).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def dispense_prescription(request, pk):
    if request.user.role != "staff":
        return Response({"error": "Only staff can dispense"}, status=403)
        
    try:
        script = Prescription.objects.get(pk=pk)
        script.is_dispensed = True
        script.save()
        return Response({"message": "Prescription marked as dispensed"})
    except Prescription.DoesNotExist:
        return Response({"error": "Script not found"}, status=404)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insights(request):
    if request.user.role not in ['doctor', 'admin']:
         return Response({"error": "Unauthorized"}, status=403)
    
    # 1. Total Patients & Age Distribution aggregated
    from django.db.models import Case, When, Value, CharField, Q
    
    patients = User.objects.filter(role='patient')
    
    # Efficient Age Aggregation (Single DB Query)
    age_buckets = patients.aggregate(
        age_0_18=Count('id', filter=Q(age__lte=18)),
        age_19_35=Count('id', filter=Q(age__gt=18, age__lte=35)),
        age_36_50=Count('id', filter=Q(age__gt=35, age__lte=50)),
        age_51_65=Count('id', filter=Q(age__gt=50, age__lte=65)),
        age_65_plus=Count('id', filter=Q(age__gt=65))
    )
    
    age_dist = {
        '0-18': age_buckets['age_0_18'],
        '19-35': age_buckets['age_19_35'],
        '36-50': age_buckets['age_36_50'],
        '51-65': age_buckets['age_51_65'],
        '65+': age_buckets['age_65_plus'],
    }
    
    total_patients = patients.count()
    
    # 3. Gender Distribution
    gender_dist = list(patients.values('gender').annotate(count=Count('gender')))
    
    # 4. Recent Appointment Trends (Last 7 days)
    today = timezone.now().date()
    start_date = today - timedelta(days=6)
    
    # Fetch appointments once for this range
    range_appts = Appointment.objects.filter(date__date__range=[start_date, today])
    appointments_last_7 = range_appts.count()
    
    # By Status
    status_stats = list(range_appts.values('status').annotate(count=Count('status')))
    
    # 5. Symptom Analysis (Optimize loop)
    # We can fetch all reasons and process in python for small sets, or use Q objects.
    # For scalability, Q objects with aggregate is better than N queries.
    symptoms = ['fever', 'cough', 'pain', 'headache', 'fatigue', 'nausea']
    
    # Build a dict of aggregation args dynamically? 
    # Or just write it out. 
    # Actually, iterate and build Qs.
    symptom_aggs = {}
    for sym in symptoms:
        symptom_aggs[sym] = Count('id', filter=Q(reason__icontains=sym))
        
    symptom_counts = range_appts.aggregate(**symptom_aggs)
    
    # Cleanup 0s
    symptom_stats = {k: v for k, v in symptom_counts.items() if v > 0}

    return Response({
        'overview': {
            'total_patients': total_patients,
            'appointments_7d': appointments_last_7,
        },
        'demographics': {
            'age': age_dist,
            'gender': gender_dist
        },
        'operational': {
            'status_breakdown': status_stats
        },
        'clinical': {
            'top_symptoms': symptom_stats
        }
    })
