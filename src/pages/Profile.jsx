import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AvatarUpload from '../components/profile/AvatarUpload';

const Profile = () => {
  const { user, userProfile } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white">
              Perfil de Usuario
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">
              Gestiona tu información personal y preferencias.
            </p>
          </div>

          {/* Content */}
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              
              {/* Avatar Section */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Foto de Perfil
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <AvatarUpload user={user} userProfile={userProfile} />
                </dd>
              </div>

              {/* Name */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Nombre Completo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.displayName || 'No especificado'}
                </dd>
              </div>

              {/* Email */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Correo Electrónico
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.email}
                </dd>
              </div>

              {/* UID (Optional, good for debugging) */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  ID de Usuario
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs text-gray-400">
                  {user.uid}
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
