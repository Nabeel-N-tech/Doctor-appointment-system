from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.CharField(source="patient.username", read_only=True)
    doctor = serializers.CharField(source="doctor.username", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)
    doctor_id = serializers.IntegerField(source="doctor.id", read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "patient", "doctor", "patient_id", "doctor_id", "date", "status", "reason", "token_number", "created_at", "payment_status", "decline_reason"]
