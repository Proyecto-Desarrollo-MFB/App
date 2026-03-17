using System;
using Volo.Abp.Application.Dtos;

namespace WishTrip.TravelExperiences
{
    public class TravelExperienceDto : FullAuditedEntityDto<Guid>
    {
        public Guid DestinationId { get; set; }
        public Guid UserId { get; set; }
        public string? Review { get; set; }
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsRepeatVisit { get; set; }  // ← NUEVO
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}