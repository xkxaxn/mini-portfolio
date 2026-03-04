import { useState } from 'react'
import { X, Copy, Check, ExternalLink } from 'lucide-react'

function ProjectModal({ project, isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState(null)

  if (!isOpen || !project) return null

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">项目访问信息</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">项目名称</span>
              <span className="text-sm font-semibold text-gray-900 text-right">{project.title}</span>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-blue-700 font-medium min-w-[3rem]">网址</span>
                <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                  <a 
                    href={project.credentials?.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    {project.credentials?.url || '暂未配置'}
                  </a>
                  <button 
                    onClick={() => handleCopy(project.credentials?.url || '', 'url')}
                    className="text-blue-400 hover:text-blue-600 p-1"
                    title="复制网址"
                  >
                    {copiedField === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-blue-700 font-medium min-w-[3rem]">账号</span>
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className="text-sm text-gray-700 font-mono bg-white/50 px-2 py-0.5 rounded">
                    {project.credentials?.username || 'admin'}
                  </span>
                  <button 
                    onClick={() => handleCopy(project.credentials?.username || 'admin', 'username')}
                    className="text-blue-400 hover:text-blue-600 p-1"
                    title="复制账号"
                  >
                    {copiedField === 'username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-blue-700 font-medium min-w-[3rem]">密码</span>
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className="text-sm text-gray-700 font-mono bg-white/50 px-2 py-0.5 rounded">
                    {project.credentials?.password || '123456'}
                  </span>
                  <button 
                    onClick={() => handleCopy(project.credentials?.password || '123456', 'password')}
                    className="text-blue-400 hover:text-blue-600 p-1"
                    title="复制密码"
                  >
                    {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {project.credentials?.remark && (
                <div className="pt-2 border-t border-blue-200/50">
                  <p className="text-xs text-blue-600 italic leading-relaxed">
                    注：{project.credentials.remark}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              取消
            </button>
            <a 
              href={project.credentials?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              立即访问
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectModal