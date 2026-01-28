from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"message": "Backend is running!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('', api_root),
]
