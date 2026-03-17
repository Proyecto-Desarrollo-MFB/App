using System;

namespace WishTrip.TravelExperiences
{
    public class UserDestinationPreferenceDto
    {
        public Guid Id { get; set; }
        public Guid DestinationId { get; set; }
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsWishlist { get; set; }
        public bool IsVisited { get; set; }
    }

    public class UpdateUserPreferenceDto
    {
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsWishlist { get; set; }
        public bool IsVisited { get; set; }
    }
}