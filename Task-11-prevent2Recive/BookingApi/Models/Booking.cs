namespace BookingApi.Models
{
    public class Booking
    {
        public int Id { get; set; }

        public int RoomId { get; set; }

        // Complete date and time of the booking slot
        public DateTime BookingDate { get; set; }

        // Identifies the user making the booking
        public string UserId { get; set; } = string.Empty;
    }
}
