using System;
using System.ComponentModel.DataAnnotations;

namespace WishTrip.TravelExperiences
{
    public class CreateUpdateTravelExperienceDto
    {
        [Required]
        public Guid DestinationId { get; set; }
        public string? Review { get; set; }
        [Range(1, 5)]
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsRepeatVisit { get; set; }  // ← NUEVO
        [Required]
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}