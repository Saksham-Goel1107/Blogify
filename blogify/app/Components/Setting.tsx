import React, { useState, useEffect } from 'react';
import { useTheme } from '../actions/DarkMode';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Setting = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const { data: session } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // 2FA states
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCode, setQRCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
      // Notification states
    const [notificationPreferences, setNotificationPreferences] = useState<{
        newFollower: boolean;
        followingPost: boolean;
    }>({
        newFollower: false,
        followingPost: false
    });

    // Profile visibility state
    const [profileVisibility, setProfileVisibility] = useState('public');
    const [showEmail, setShowEmail] = useState(false);

    // Load user settings
    useEffect(() => {
        const loadUserSettings = async () => {
            try {
                const response = await fetch('/api/user/profile');                const data = await response.json();
                if (data.user) {
                    setTwoFactorEnabled(data.user.twoFactorEnabled || false);
                    if (data.user.notificationPreferences) {
                        setNotificationPreferences({
                            newFollower: data.user.notificationPreferences.newFollower ?? false,
                            followingPost: data.user.notificationPreferences.followingPost ?? false
                        });
                        // Setup Firebase messaging if notifications are enabled
                        if (data.user.notificationPreferences.newFollower || 
                            data.user.notificationPreferences.followingPost) {
                            setupFirebaseMessaging();
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };

        if (session?.user) {
            loadUserSettings();
        }
    }, [session]);

    // Firebase messaging setup
    const setupFirebaseMessaging = async () => {
        try {
            const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };

            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);
            
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging);
                if (token) {
                    // Save FCM token to backend
                    await fetch('/api/user/fcm-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ fcmToken: token })
                    });
                }
            }
        } catch (error) {
            console.error('Error setting up notifications:', error);
        }
    };

    // Handle 2FA setup
    const handle2FASetup = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/2fa/setup', {
                method: 'POST'
            });
            const data = await response.json();
            if (data.qrCode) {
                setQRCode(data.qrCode);
                setShowQRCode(true);
            }
        } catch (error) {
            setError('Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    // Handle 2FA verification
    const handle2FAVerify = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: verificationCode })
            });
            if (response.ok) {
                setTwoFactorEnabled(true);
                setShowQRCode(false);
                setSuccess('2FA enabled successfully');
            } else {
                setError('Invalid verification code');
            }
        } catch (error) {
            setError('Failed to verify 2FA code');
        } finally {
            setLoading(false);
        }
    };

    // Handle 2FA disable
    const handle2FADisable = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/2fa/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: verificationCode })
            });
            if (response.ok) {
                setTwoFactorEnabled(false);
                setSuccess('2FA disabled successfully');
            } else {
                setError('Invalid verification code');
            }
        } catch (error) {
            setError('Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };    // Handle notification preference changes
    const handleNotificationPreferenceChange = async (key: 'newFollower' | 'followingPost') => {
        try {
            setLoading(true);
            const newPreferences = {
                ...notificationPreferences,
                [key]: !notificationPreferences[key]
            };
            
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notificationPreferences: newPreferences
                })
            });
            
            if (response.ok) {
                setNotificationPreferences(newPreferences);
                setSuccess('Notification preferences updated successfully');
                if (newPreferences.newFollower || newPreferences.followingPost) {
                    await setupFirebaseMessaging();
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update notification preferences');
            }
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            setError('Failed to update notification preferences');
        } finally {
            setLoading(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                setLoading(true);
                const response = await fetch('/api/user/delete', {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    router.push('/');
                } else {
                    setError('Failed to delete account');
                }
            } catch (error) {
                setError('Failed to delete account');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={`rounded-xl shadow-lg ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } p-4 sm:p-6`}>
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-600 rounded-lg">
                    {success}
                </div>
            )}

            {/* Appearance Settings */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Appearance</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Switch between light and dark themes
                            </p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                darkMode 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'bg-blue-500 hover:bg-blue-600'
                            } text-white transition-colors`}
                        >
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Security</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                            {!twoFactorEnabled ? (
                                <button
                                    onClick={handle2FASetup}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                        darkMode 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-green-500 hover:bg-green-600'
                                    } text-white transition-colors`}
                                >
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Enable 2FA'}
                                </button>
                            ) : (
                                <button
                                    onClick={handle2FADisable}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                        darkMode 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-red-500 hover:bg-red-600'
                                    } text-white transition-colors`}
                                >
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Disable 2FA'}
                                </button>
                            )}
                        </div>

                        {showQRCode && (
                            <div className="mt-4">
                                <p className="mb-2">Scan this QR code with your authenticator app:</p>
                                <img src={qrCode} alt="2FA QR Code" className="mb-4" />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter verification code"
                                        className={`flex-1 px-3 py-2 rounded-lg ${
                                            darkMode 
                                                ? 'bg-gray-800 text-white border-gray-600' 
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } border focus:ring-2 focus:ring-blue-500`}
                                    />
                                    <button
                                        onClick={handle2FAVerify}
                                        disabled={loading || !verificationCode}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                            darkMode 
                                                ? 'bg-blue-600 hover:bg-blue-700' 
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white transition-colors`}
                                    >
                                        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Notifications</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">New Follower Notifications</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Get notified when someone follows you
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={notificationPreferences?.newFollower || false}
                                    disabled={loading}
                                    onChange={() => handleNotificationPreferenceChange('newFollower')}
                                />
                                <div className={`w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Following Posts Notifications</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Get notified when someone you follow creates a new post
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={notificationPreferences?.followingPost || false}
                                    disabled={loading}
                                    onChange={() => handleNotificationPreferenceChange('followingPost')}
                                />
                                <div className={`w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Management */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Account Management</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-4">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                                darkMode 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-red-500 hover:bg-red-600'
                            } text-white transition-colors`}
                        >
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Delete Account'}
                        </button>
                        <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            This action cannot be undone. All your data will be permanently deleted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;
