from django.urls import path
from .views import (
    register, login, profile, 
    get_appointments, create_appointment, get_doctors, 
    get_users, request_password_reset, reset_password_confirm, 
    admin_create_user, delete_user, admin_update_user, get_user_detail,
    get_notifications, mark_notification_read,
    update_appointment_status,
    pay_appointment, cancel_my_appointment,
    create_payment_intent, get_stripe_config,
    get_lab_reports, create_lab_report, create_referral, toggle_availability,
    create_prescription, get_prescriptions, dispense_prescription,
    ai_insights
)

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("profile/", profile),
    path("appointments/", get_appointments),
    path("appointments/create/", create_appointment),
    path("appointments/<int:pk>/status/", update_appointment_status),
    path("appointments/<int:pk>/pay/", pay_appointment),
    path("appointments/create-payment-intent/<int:pk>/", create_payment_intent),
    path("stripe-config/", get_stripe_config),
    path("appointments/<int:pk>/cancel/", cancel_my_appointment),
    path("doctors/", get_doctors),
    path("users/", get_users),
    path("users/<int:user_id>/", get_user_detail),
    path("users/create/", admin_create_user), # Admin only
    path("users/<int:user_id>/delete/", delete_user),
    path("users/<int:user_id>/update/", admin_update_user),
    path("request-reset/", request_password_reset),
    path("confirm-reset/", reset_password_confirm),
    path("notifications/", get_notifications),
    path("notifications/<int:notif_id>/read/", mark_notification_read),
    path("lab-reports/", get_lab_reports),
    path("lab-reports/create/", create_lab_report),
    path("referrals/create/", create_referral),
    path("doctor/toggle-availability/", toggle_availability),
    path("prescriptions/", get_prescriptions),
    path("prescriptions/create/", create_prescription),
    path("prescriptions/<int:pk>/dispense/", dispense_prescription),
]
