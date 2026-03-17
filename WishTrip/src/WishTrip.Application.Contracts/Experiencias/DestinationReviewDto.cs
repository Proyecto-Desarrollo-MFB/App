using System;
using Volo.Abp.Application.Dtos;

namespace WishTrip.TravelExperiences
{
    public class DestinationReviewDto : EntityDto<Guid>
    {
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatarUrl { get; set; }
        public string? Review { get; set; }
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreationTime { get; set; }
        public bool IsRepeatVisit { get; set; }
    }
}