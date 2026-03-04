import { useState } from 'react'
import { X, Copy, Check, Mail, Phone, MessageSquare, Linkedin, Twitter, Github, Link, Globe } from 'lucide-react'

function ContactModal({ isOpen, onClose, contactInfo }) {
  const [copiedField, setCopiedField] = useState(null)

  if (!isOpen) return null

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Use provided contact info
  // Support both new array format and legacy object format
  const contacts = Array.isArray(contactInfo) 
    ? contactInfo 
    : (contactInfo ? [
        { platform: 'Phone', value: contactInfo.phone },
        { platform: 'Email', value: contactInfo.email },
        { platform: 'WeChat', value: contactInfo.wechat }
      ].filter(c => c.value) : [])

  const getIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('phone') || p.includes('mobile') || p.includes('tel')) return Phone;
    if (p.includes('email') || p.includes('mail')) return Mail;
    if (p.includes('wechat') || p.includes('weixin')) return MessageSquare;
    if (p.includes('linkedin')) return Linkedin;
    if (p.includes('twitter') || p.includes('x')) return Twitter;
    if (p.includes('github') || p.includes('git')) return Github;
    if (p.includes('web') || p.includes('site') || p.includes('blog')) return Globe;
    return Link;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">联系我</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-500 text-sm text-center">
            如果您有任何问题或合作意向，欢迎通过以下方式联系我。
          </p>
          
          <div className="space-y-3">
            {contacts.map((c, idx) => {
              const Icon = getIcon(c.platform);
              return (
                <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">{c.platform}</p>
                      <p className="text-gray-900 font-medium truncate">{c.value}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(c.value, idx)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="复制"
                    >
                      {copiedField === idx ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {contacts.length === 0 && (
               <div className="text-center py-8 text-gray-400 text-sm">暂无联系方式</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactModal