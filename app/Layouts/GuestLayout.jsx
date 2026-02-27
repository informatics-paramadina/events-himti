import { Link } from '@/utils/inertia-compat';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-green-600">EventHub</div>
                        <span className="text-sm text-gray-600">Campus Events</span>
                    </Link>
                    <nav className="hidden sm:flex gap-6">
                        <Link href="/events" className="text-gray-700 hover:text-green-600 transition">
                            Events
                        </Link>
                        <Link href="/login" className="text-gray-700 hover:text-green-600 transition">
                            Login
                        </Link>
                        <Link href="/register" className="text-gray-700 hover:text-green-600 transition">
                            Register
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 sm:px-8 py-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 py-6 text-center text-gray-600 text-sm">
                <p>© 2024 EventHub Campus. All rights reserved.</p>
            </div>
        </div>
    );
}
