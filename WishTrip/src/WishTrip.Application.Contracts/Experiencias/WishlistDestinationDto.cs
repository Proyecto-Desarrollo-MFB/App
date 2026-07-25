using System;

namespace WishTrip.TravelExperiences
{
    public class WishlistDestinationDto
    {
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; }
        public string DestinationPais { get; set; }
        public string? DestinationImageUrl { get; set; }
        public double Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsWishlist { get; set; }
        public bool IsVisited { get; set; }
    }
}