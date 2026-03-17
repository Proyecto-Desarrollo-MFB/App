using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace WishTrip.TravelExperiences
{
    public class TravelExperience : FullAuditedAggregateRoot<Guid>
    {
        public Guid DestinationId { get; set; }
        public Guid UserId { get; set; }
        public string? Review { get; set; }
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsRepeatVisit { get; set; }  // ← NUEVO
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        protected TravelExperience() { }

        public TravelExperience(
            Guid id,
            Guid destinationId,
            Guid userId,
            string? review,
            int rating,
            bool isFavorite,
            bool isRepeatVisit,
            DateTime startDate,
            DateTime? endDate) : base(id)
        {
            DestinationId = destinationId;
            UserId = userId;
            Review = review;
            Rating = rating;
            IsFavorite = isFavorite;
            IsRepeatVisit = isRepeatVisit;
            StartDate = startDate;
            EndDate = endDate;
        }
    }
}