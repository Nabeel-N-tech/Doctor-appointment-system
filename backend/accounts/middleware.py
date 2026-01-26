import traceback

class ExceptionLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        try:
            with open("C:/Users/nabee/reactprojectssubmit/final_project/backend/server_errors.log", "a") as f:
                f.write(f"\n--- Unhandled Exception in Middleware/View ---\nPath: {request.path}\nUser: {request.user}\n{str(exception)}\n{traceback.format_exc()}\n")
        except Exception as log_error:
            print(f"Failed to log exception: {log_error}")
        return None
