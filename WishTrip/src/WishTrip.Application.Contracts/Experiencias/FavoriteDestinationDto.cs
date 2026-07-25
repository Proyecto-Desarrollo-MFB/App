using System;

namespace WishTrip.TravelExperiences
{
    public class FavoriteDestinationDto
    {
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public string DestinationPais { get; set; } = string.Empty;
        public string? DestinationImageUrl { get; set; }
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsWishlist { get; set; }
        public bool IsVisited { get; set; }
    }
}