import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function EditEvent({ auth, event }) {
    const { data, setData, put, processing, errors } = useForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? event.date.substring(0, 16) : '',
        location: event.location || '',
        quota: event.quota || '',
        status: event.status || 'DRAFT',
        poster: null,
    });

    const [previewImage, setPreviewImage] = useState(
        event.poster ? `/storage/${event.poster}` : null
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/events/${event.id}`);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('poster', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Event</h2>}
        >
            <Head title="Edit Event" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Tech Workshop 2024"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe your event..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Date and Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        id="date"
                                        type="datetime-local"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        id="location"
                                        type="text"
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Auditorium or Zoom Link"
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                                </div>
                            </div>

                            {/* Quota and Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="quota" className="block text-sm font-medium text-gray-700 mb-2">
                                        Quota *
                                    </label>
                                    <input
                                        id="quota"
                                        type="number"
                                        min="1"
                                        value={data.quota}
                                        onChange={e => setData('quota', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 100"
                                    />
                                    {errors.quota && <p className="mt-1 text-sm text-red-600">{errors.quota}</p>}
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>
                            </div>

                            {/* Poster Upload */}
                            <div>
                                <label htmlFor="poster" className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Poster
                                </label>
                                <input
                                    id="poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Leave empty to keep current poster
                                </p>
                                {errors.poster && <p className="mt-1 text-sm text-red-600">{errors.poster}</p>}
                                
                                {previewImage && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Current/Preview:</p>
                                        <img src={previewImage} alt="Preview" className="max-w-md rounded-lg shadow-sm" />
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <a
                                    href={`/events/${event.id}`}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </a>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
