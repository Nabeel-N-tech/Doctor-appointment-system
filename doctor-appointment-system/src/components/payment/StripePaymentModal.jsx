import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import apiClient from "../../api/apiClient";

// Simple Checkout Form
function CheckoutForm({ onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        // Confirm Payment
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is required for some payment methods
                return_url: window.location.origin,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess();
            setLoading(false);
        } else {
            setMessage("Payment status: " + paymentIntent.status);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-1">
            <PaymentElement />

            {message && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {message}
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                >
                    Cancel
                </button>
                <button
                    disabled={loading || !stripe || !elements}
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:bg-blue-400"
                >
                    {loading ? "Processing..." : "Pay Now"}
                </button>
            </div>
        </form>
    );
}

export default function StripePaymentModal({ appointmentId, onClose, onSuccess }) {
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Fetch configuration
        apiClient.get("/stripe-config/").then((res) => {
            if (res.data.publishableKey) {
                setStripePromise(loadStripe(res.data.publishableKey));
            } else {
                console.error("Stripe Publishable Key not found in response");
                toast.error("Payment system unavailable");
                onClose();
            }
        }).catch(err => {
            console.error("Failed to load stripe config", err);
            toast.error("Connection to payment system failed");
        });
    }, []);

    useEffect(() => {
        // Create PaymentIntent
        apiClient.post(`/appointments/create-payment-intent/${appointmentId}/`).then((res) => {
            setClientSecret(res.data.clientSecret);
        }).catch(() => {
            toast.error("Could not init payment");
            onClose(); // We call onClose if it fails, but don't list it as dep to avoid loops
        });
    }, [appointmentId]);

    const handleSuccess = async () => {
        try {
            await apiClient.post(`/appointments/${appointmentId}/pay/`);
            toast.success("Payment Successful!");
            onSuccess();
        } catch (e) {
            toast.error("Error updating payment status.");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                    Make Payment
                </h2>

                {clientSecret && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm onSuccess={handleSuccess} onCancel={onClose} />
                    </Elements>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Loading payment details...
                    </div>
                )}
            </div>
        </div>
    );
}
