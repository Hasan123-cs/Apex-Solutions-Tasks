using Microsoft.EntityFrameworkCore;
using UserManagement.Data;
using UserManagement.Models;


namespace UserManagement.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        private readonly CacheService _cache;


        public UserService(
            AppDbContext context,
            CacheService cache)
        {
            _context = context;
            _cache = cache;
        }



        public async Task<List<User>> GetUsers()
        {
            string cacheKey = "users";



            var cachedUsers =
                await _cache.GetAsync<List<User>>(cacheKey);



            if (cachedUsers != null)
            {
                Console.WriteLine(
                    "Users loaded from Cache"
                );

                return cachedUsers;
            }




            var users =
                await _context.Users.ToListAsync();



            Console.WriteLine(
                "Users loaded from Database"
            );



            await _cache.SetAsync(
                cacheKey,
                users,
                int.MaxValue
            );


            return users;
        }




        public async Task<User?> GetUserById(int id)
        {
            var users = await GetUsers();


            return users.FirstOrDefault(
                x => x.Id == id
            );
        }




        public async Task DeleteUser(int id)
        {

            Console.WriteLine(
                "Delete scheduled..."
            );





            var user =
                await _context.Users
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );



            if (user != null)
            {
                _context.Users.Remove(user);


                await _context.SaveChangesAsync();


                Console.WriteLine(
                    "User deleted from Database"
                );
            }



            var updatedUsers =
                await _context.Users.ToListAsync();



            await _cache.SetAsync(
                "users",
                updatedUsers,
                int.MaxValue
            );


            Console.WriteLine(
                "Cache updated"
            );
        }
    }
}