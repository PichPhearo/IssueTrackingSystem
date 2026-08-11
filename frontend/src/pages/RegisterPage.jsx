import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import Particles from '../components/reactbit/background';

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-white overflow-hidden">
      {/* Interactive Particles Background */}
      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={400}
        ease={80}
        color="#000000"
        size={0.6}
        staticity={40}
      />

      {/* Form Content */}
      <div className="relative z-10 w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}

