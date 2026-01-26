from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # What kind of user is this? (Admin, Doctor, Staff, or Patient)
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("doctor", "Doctor"),
        ("staff", "Staff"),
        ("patient", "Patient"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="patient")
    
    # If the user is a doctor, what is their specialty? (e.g., Cardiologist)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    
    # Code sent to email to reset password if they forget it
    reset_code = models.CharField(max_length=6, blank=True, null=True)
    
    # Is the doctor currently free to see patients?
    is_available = models.BooleanField(default=True)
    
    # --- Profile Information (mostly for patients) ---
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")], blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    
    # Any past sicknesses or allergies we should know about?
    medical_history = models.TextField(blank=True, null=True, help_text="e.g. Allergies to peanuts, Asthma")

class Appointment(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appointments_as_patient")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appointments_as_doctor")
    date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("confirmed", "Confirmed"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
        ],
        default="pending"
    )
    reason = models.TextField(blank=True, null=True)
    diagnosis = models.TextField(blank=True, null=True)
    vitals = models.TextField(blank=True, null=True, help_text="JSON or text of vitals (BP, Temp, Weight)")
    token_number = models.PositiveIntegerField(null=True, blank=True)
    decline_reason = models.TextField(blank=True, null=True)
    payment_status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("paid", "Paid")],
        default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.patient.username} with {self.doctor.username} on {self.date}"

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.recipient.username}: {self.message}"

class LabReport(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lab_reports")
    doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="ordered_reports")
    test_name = models.CharField(max_length=100)
    result = models.TextField()
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("completed", "Completed")], default="completed")
    observed_value = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. 7.3")
    unit = models.CharField(max_length=20, blank=True, null=True, help_text="e.g. mg/dL")
    reference_range = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. 10-20")
    specimen_type = models.CharField(max_length=100, default="Serum", blank=True)
    testing_method = models.CharField(max_length=100, default="Fully Automated Biochemistry Analyzer", blank=True)
    clinical_interpretation = models.TextField(blank=True, null=True, help_text="Actionable insights and medical context")
    date = models.DateTimeField(auto_now_add=True)
    file_url = models.FileField(upload_to="lab_reports/", blank=True, null=True)

    def __str__(self):
        return f"{self.test_name} for {self.patient.username}"

class Referral(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="referrals_received")
    from_doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="referrals_made")
    to_doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="referrals_to_me")
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Referral of {self.patient.username} from {self.from_doctor.username} to {self.to_doctor.username}"

class Prescription(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="scripts_written")
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="scripts_received")
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    medicines = models.TextField(help_text="Simple text list or JSON of medicines")
    notes = models.TextField(blank=True, null=True)
    is_dispensed = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Script for {self.patient.username} by {self.doctor.username}"
