using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace WishTrip.Destinos
{
    // Usamos AuditedAggregateRoot para que ABP nos guarde CreationTime y LastModificationTime solos
    public class UserDestinationPreference : AuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public Guid DestinationId { get; set; }

        // Los datos del panel visual
        public int Rating { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsWishlist { get; set; }
        public bool IsVisited { get; set; }

        protected UserDestinationPreference() { }

        public UserDestinationPreference(
            Guid id,
            Guid userId,
            Guid destinationId,
            int rating = 0,
            bool isFavorite = false,
            bool isWishlist = false,
            bool isVisited = false) : base(id)
        {
            UserId = userId;
            DestinationId = destinationId;
            Rating = rating;
            IsFavorite = isFavorite;
            IsWishlist = isWishlist;
            IsVisited = isVisited;
        }
    }
}