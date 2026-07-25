using System;

namespace WishTrip.TravelExperiences
{
    public class UserReviewDto
    {
        public Guid Id { get; set; }
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public string? DestinationImageUrl { get; set; }
        public int Rating { get; set; }
        public string? Review { get; set; }
        public DateTime? StartDate { get; set; }
        public bool IsFavorite { get; set; }
        public string? DestinationPais { get; set; }
    }
}