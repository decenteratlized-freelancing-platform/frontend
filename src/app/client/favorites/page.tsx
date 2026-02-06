import { FavoritesView } from "@/components/shared/favorites-view"

export default function ClientFavoritesPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FavoritesView userRole="client" />
        </div>
    )
}
