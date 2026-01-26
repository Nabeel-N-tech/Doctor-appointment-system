from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Appointment

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()
    # Optional profile fields
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    age = serializers.CharField(required=False, allow_blank=True) # Accept string to handle ""
    gender = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.CharField(required=False, allow_blank=True)
    medical_history = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data.get('role') == 'patient':
            required_fields = ['age', 'gender', 'phone_number', 'blood_group', 'address', 'medical_history']
            for field in required_fields:
                if not data.get(field) or str(data.get(field)).strip() == "":
                    raise serializers.ValidationError({field: ["This field is required for patients."]})
        return data

    def create(self, validated_data):
        # Extract extra fields
        age_raw = validated_data.get('age', None)
        age = None
        if age_raw and str(age_raw).strip():
             try:
                 age = int(age_raw)
             except ValueError:
                 pass

        extra_fields = {
            'phone_number': validated_data.get('phone_number', ''),
            'address': validated_data.get('address', ''),
            'gender': validated_data.get('gender', ''),
            'blood_group': validated_data.get('blood_group', ''),
            'medical_history': validated_data.get('medical_history', ''),
            'age': age
        }
        
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        
        # Update user with extra fields
        for key, value in extra_fields.items():
            if value is not None:
                setattr(user, key, value)
        user.save()
        return user




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "specialization", "phone_number", "address", "age", "gender", "blood_group", "medical_history", "is_available"]

from .models import LabReport
class LabReportSerializer(serializers.ModelSerializer):
    patient = serializers.CharField(source="patient.username", read_only=True)
    doctor = serializers.SerializerMethodField()
    
    class Meta:
        model = LabReport
        fields = ["id", "patient", "doctor", "test_name", "result", "status", "date", "file_url", "observed_value", "unit", "reference_range", "specimen_type", "testing_method", "clinical_interpretation"]

    def get_doctor(self, obj):
        return obj.doctor.username if obj.doctor else "Unknown"

from .models import Prescription
class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.username", read_only=True)
    doctor_name = serializers.CharField(source="doctor.username", read_only=True)
    
    class Meta:
        model = Prescription
        fields = ["id", "doctor", "doctor_name", "patient", "patient_name", "appointment", "medicines", "notes", "is_dispensed", "date"]

class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.CharField(source="patient.username", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)
    doctor = serializers.CharField(source="doctor.username", read_only=True)
    doctor_id = serializers.IntegerField(source="doctor.id", read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "patient", "patient_id", "doctor", "doctor_id", "date", "status", "reason", "diagnosis", "token_number", "payment_status", "vitals", "decline_reason"]
