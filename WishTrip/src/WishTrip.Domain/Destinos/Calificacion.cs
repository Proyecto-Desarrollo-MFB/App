using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace WishTrip.Destinos
{
    public class Calificacion : AuditedAggregateRoot<Guid>, IUserOwned
    {
        public Guid DestinoId { get; set; }
        public int Puntaje { get; set; }
        public string Comentario { get; set; }

        public Guid UserId { get; set; }

        public Calificacion() { }

        public Calificacion(Guid id, Guid destinoId, int puntaje, string comentario, Guid userId)
            : base(id)
        {
            DestinoId = destinoId;
            Puntaje = puntaje;
            Comentario = comentario;
            UserId = userId;
        }
    }
}