import { Resend } from 'resend';

// Helper for Resend (Email)
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key_here');

export async function sendInvoiceEmail(to: string, invoiceCode: string, paymentUrl: string | null) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("Mocking Email Send. RESEND_API_KEY is not set.");
      console.log(`To: ${to}, Invoice: ${invoiceCode}, URL: ${paymentUrl}`);
      return { success: true, mocked: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'Roastery OS <hello@beanslab.vercel.app>', // Change this to verified domain
      to: [to],
      subject: `Invoice Anda: ${invoiceCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4a373;">Terima Kasih Atas Pesanan Anda!</h2>
          <p>Berikut adalah invoice untuk pesanan Anda dengan kode: <strong>${invoiceCode}</strong>.</p>
          ${paymentUrl ? `
            <p>Silakan selesaikan pembayaran Anda melalui tautan aman Midtrans berikut:</p>
            <a href="${paymentUrl}" style="display: inline-block; padding: 12px 24px; background-color: #d4a373; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
              Bayar Sekarang
            </a>
          ` : `
            <p>Silakan lakukan pembayaran sesuai instruksi pada invoice.</p>
          `}
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />
          <p style="font-size: 12px; color: #666;">
            Email ini dikirim otomatis oleh Roastery OS. Harap jangan membalas email ini.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// Helper for WhatsApp (Fonnte/Watzap Placeholder)
export async function sendInvoiceWhatsApp(phone: string, invoiceCode: string, paymentUrl: string | null) {
  try {
    // 1. Format phone number to international (e.g. 0812 -> 62812)
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    }

    const message = `Halo! Terima kasih atas pesanan Anda.\n\n` +
      `Kode Invoice: *${invoiceCode}*\n\n` +
      (paymentUrl ? `Silakan selesaikan pembayaran melalui tautan berikut:\n${paymentUrl}\n\n` : '') +
      `Terima kasih telah berbelanja bersama kami!`;

    // 2. Mocking logic since there's no API key yet
    if (!process.env.WA_API_KEY) {
      console.log("Mocking WA Send. WA_API_KEY is not set.");
      console.log(`To: ${formattedPhone}\nMessage: ${message}`);
      return { success: true, mocked: true };
    }

    /*
    // Example implementation for Fonnte:
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": process.env.WA_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message
      })
    });
    const result = await response.json();
    */

    return { success: true, mocked: false };
  } catch (error) {
    console.error("Failed to send WA:", error);
    return { success: false, error };
  }
}
