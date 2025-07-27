import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';

interface WhatsAppResponse {
  from: string;
  message: string;
  createdAt: string;
}

export default function WhatsAppResponses() {
  const [responses, setResponses] = useState<WhatsAppResponse[]>([]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/whatsapp/responses`);
        setResponses(response.data.responses || []);
      } catch (error) {
        console.error('Error fetching WhatsApp responses:', error);
      }
    };

    fetchResponses();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">
          <MessageSquare className="inline-block mr-2" />
          WhatsApp Responses
        </h2>
      </div>

      {responses.length > 0 ? (
        <ul className="space-y-4">
          {responses.map((response, index) => (
            <li key={index} className="border rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{response.from}</p>
              <p className="text-gray-700">{response.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(response.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No responses yet.</p>
      )}
    </div>
  );
}