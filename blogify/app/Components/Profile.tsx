"use client";

import { useState,useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faSpinner, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../actions/DarkMode';

interface ProfileComponentProps {
  username: string;
  bio: string;
  interests: string[];
  profilePic: string | null;
  isEditing: boolean;
  isUploading: boolean;
  darkMode: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onInterestToggle: (interest: string) => void;
  hasSetUsername: boolean;
  isSetupMode: boolean;
  errorMessage?: string;
  successMessage?: string;
}

export default function ProfileComponent({
  username,
  bio,
  interests,
  profilePic,
  isEditing,
  isUploading,
  darkMode,
  onEdit,
  onSave,
  onCancel,
  onImageSelect,
  onImageRemove,
  onUsernameChange,
  onBioChange,
  onInterestToggle,
  hasSetUsername,
  isSetupMode,
  errorMessage,
  successMessage,
}: ProfileComponentProps) {
  const [searchInterest, setSearchInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInterestSearch = (search: string) => {
    setSearchInterest(search);
  };

  const PREDEFINED_INTERESTS = ['Music', 'Sports', 'Travel', 'Technology', 'Art', 'Cooking'];
  const filteredInterests = PREDEFINED_INTERESTS.filter((interest: any) =>
    interest.toLowerCase().includes(searchInterest.toLowerCase())
  );

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      {errorMessage && (
        <div className="mb-4 text-center">
          <p className="text-red-500 text-sm">{errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 text-center">
          <p className="text-green-500 text-sm">{successMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
              darkMode ? 'border-gray-800' : 'border-white'
            } relative`}>
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt={`${username || 'User'}'s profile picture`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <FontAwesomeIcon icon={faUser} className="text-3xl text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 right-0 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors duration-200`}
                disabled={isUploading}
                title="Upload new image"
              >
                {isUploading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faCamera} />
                )}
              </button>
              {profilePic && (
                <button
                  onClick={onImageRemove}
                  className={`p-2 rounded-full ${
                    darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  } text-white transition-colors duration-200`}
                  title="Remove image"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{username || 'New User'}</h2>
            <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {bio || 'No bio yet'}
            </p>
          </div>
        </div>
        {!isSetupMode && !isEditing && (
          <button
            onClick={onEdit}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faPen} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile form fields */}
        {/* ... Rest of your existing form fields ... */}
      </div>

      {isEditing && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <button
              onClick={onSave}
              disabled={bio.length > 0 && bio.length < 10}
              className={`flex-1 py-3 rounded-lg text-white font-medium ${
                darkMode 
                  ? bio.length > 0 && bio.length < 10 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700' 
                  : bio.length > 0 && bio.length < 10
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className={`px-6 py-3 rounded-lg border ${
                darkMode
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-300 hover:bg-gray-100'
              } transition-colors`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
