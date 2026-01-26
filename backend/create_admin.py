import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

def create_admin():
    username = "admin"
    password = "admin123"
    email = "admin@example.com"
    
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        print(f"User '{username}' already exists.")
        if user.role != 'admin':
            user.role = 'admin'
            user.save()
            print(f"Updated '{username}' role to 'admin'.")
        else:
            print(f"User '{username}' is already an admin.")
    else:
        user = User.objects.create_superuser(username=username, email=email, password=password)
        user.role = 'admin'
        user.save()
        print(f"Created admin user: {username} / {password}")

if __name__ == "__main__":
    create_admin()
