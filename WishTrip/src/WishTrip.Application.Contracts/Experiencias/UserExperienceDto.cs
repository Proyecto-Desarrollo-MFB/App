using System;
using Volo.Abp.Application.Dtos;

namespace WishTrip.TravelExperiences
{
    public class UserExperienceDto : FullAuditedEntityDto<Guid>
    {
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public string DestinationPais { get; set; } = string.Empty;
        public string? DestinationImageUrl { get; set; }
        public string? Review { get; set; }
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsRepeatVisit { get; set; }  // ← NUEVO
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}