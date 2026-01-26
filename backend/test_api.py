import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/accounts"

def test_register():
    print("Testing Register...")
    try:
        response = requests.post(f"{BASE_URL}/register/", json={
            "username": "testuser_api_test",
            "password": "testpassword123"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_login():
    print("\nTesting Login...")
    try:
        response = requests.post(f"{BASE_URL}/login/", json={
            "username": "testuser_api_test",
            "password": "testpassword123"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
    test_login()
