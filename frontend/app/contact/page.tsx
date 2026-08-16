'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يتم ربط الكود بقاعدة البيانات أو إرسال الإيميل
    alert(`شكرًا لتواصلكِ معنا! تم استلام رسالتكِ من: ${email}`);
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center" dir="rtl">
      <h1 className="text-3xl font-serif font-semibold mb-4 text-foreground">تواصلوا معنا</h1>
      <p className="text-muted-foreground mb-8">
        لديكِ أي استفسار أو اقتراح؟ يسعدنا جداً سماع صوتكِ.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-border bg-background rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 text-right"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            رسالتكِ
          </label>
          <textarea
            id="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-border bg-background rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 text-right"
            placeholder="اكتبي استفساركِ هنا..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-foreground text-background font-medium rounded-md hover:bg-foreground/90 transition-colors"
        >
          إرسال الرسالة
        </button>
      </form>
    </div>
  )
}