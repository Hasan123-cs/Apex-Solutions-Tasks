using Enyim.Caching;

namespace UserManagement.Services
{
    public class CacheService
    {
        private readonly IMemcachedClient _cache;


        public CacheService(IMemcachedClient cache)
        {
            _cache = cache;
        }


        public async Task<T?> GetAsync<T>(string key)
        {
            return await _cache.GetValueAsync<T>(key);
        }



        public async Task SetAsync<T>(
            string key,
            T value,
            int sec)
        {
            await _cache.SetAsync(
                key,
                value,
                TimeSpan.FromSeconds(sec)
            );
        }



        public async Task RemoveAsync(string key)
        {
            await _cache.RemoveAsync(key);
        }
    }
}