import { OptimizedImage } from './OptimizedImage';

/**
 * CDN 测试组件
 * 用于验证 CDN 图片加载是否正常
 */
export function CDNTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">CDN 图片加载测试</h1>

      <div className="space-y-8">
        {/* 测试头像 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">用户头像测试</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <OptimizedImage
                src="/avatars/amazong.jpg"
                alt="阿吗粽"
                className="w-full rounded-full"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">阿吗粽 (CDN)</p>
            </div>
            <div>
              <OptimizedImage
                src="/avatars/sanmu.jpg"
                alt="三木"
                className="w-full rounded-full"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">三木 (CDN)</p>
            </div>
            <div>
              <OptimizedImage
                src="/avatars/yuge.jpg"
                alt="雨哥"
                className="w-full rounded-full"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">雨哥 (CDN)</p>
            </div>
            <div>
              <OptimizedImage
                src="/avatars/amazong.jpg"
                alt="阿吗粽 (本地)"
                className="w-full rounded-full"
                useCDN={false}
              />
              <p className="text-center text-sm mt-2">阿吗粽 (本地)</p>
            </div>
          </div>
        </section>

        {/* 测试封面 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">视频封面测试</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <OptimizedImage
                src="/covers/BV1AnJCztE1x.jpg"
                alt="视频封面 CDN"
                className="w-full rounded-lg"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">CDN 加载</p>
            </div>
            <div>
              <OptimizedImage
                src="/covers/BV1AnJCztE1x.jpg"
                alt="视频封面 本地"
                className="w-full rounded-lg"
                useCDN={false}
              />
              <p className="text-center text-sm mt-2">本地加载</p>
            </div>
          </div>
        </section>

        {/* 测试 UP 主图片 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">UP主成员图片测试</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <OptimizedImage
                src="/up-members/amazong.png"
                alt="阿吗粽 UP主"
                className="w-full rounded-lg"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">阿吗粽 (CDN)</p>
            </div>
            <div>
              <OptimizedImage
                src="/up-members/sanmu.png"
                alt="三木 UP主"
                className="w-full rounded-lg"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">三木 (CDN)</p>
            </div>
            <div>
              <OptimizedImage
                src="/up-members/yuge.png"
                alt="雨哥 UP主"
                className="w-full rounded-lg"
                useCDN={true}
              />
              <p className="text-center text-sm mt-2">雨哥 (CDN)</p>
            </div>
          </div>
        </section>

        {/* 使用说明 */}
        <section className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">✅ 验证步骤</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>打开浏览器开发者工具 (F12)</li>
            <li>切换到 Network 标签</li>
            <li>刷新页面</li>
            <li>查看图片请求的域名是否为 <code className="bg-white px-1">cdn.xygss.saneko.me</code></li>
            <li>检查图片格式是否为 <code className="bg-white px-1">.webp</code></li>
            <li>对比 CDN 和本地加载的速度差异</li>
          </ol>
        </section>

        {/* CDN 配置信息 */}
        <section className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">📋 CDN 配置信息</h2>
          <div className="text-sm space-y-1">
            <p><strong>CDN 域名:</strong> <code className="bg-white px-1">http://cdn.xygss.saneko.me</code></p>
            <p><strong>示例 URL:</strong> <code className="bg-white px-1">http://cdn.xygss.saneko.me/avatars/amazong.webp</code></p>
            <p><strong>默认启用:</strong> 是（所有 OptimizedImage 组件默认使用 CDN）</p>
            <p><strong>禁用方法:</strong> 设置 <code className="bg-white px-1">useCDN={'{false}'}</code></p>
          </div>
        </section>
      </div>
    </div>
  );
}
