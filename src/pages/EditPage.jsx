import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
    Save, User, Briefcase, Mail, Code, LogOut, Home, Plus, Trash2, 
    AlertCircle, LayoutGrid, ChevronRight, Loader2, Sparkles, Image as ImageIcon, Link as LinkIcon,
    Phone, MessageCircle, FileJson, Download, Upload, Copy, Check, Linkedin, Twitter, Github, Globe, X, RotateCcw
} from 'lucide-react';

// --- Utility Functions ---

function cloneJson(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function normalizeData(input) {
    const base = isPlainObject(input) ? cloneJson(input) : {};

    const profile = isPlainObject(base.profile) ? base.profile : {};
    const contact = Array.isArray(base.contact) ? base.contact : (
        isPlainObject(base.contact) ? [
            { platform: 'Phone', value: base.contact.phone || '' },
            { platform: 'Email', value: base.contact.email || '' },
            { platform: 'WeChat', value: base.contact.wechat || '' },
        ].filter(c => c.value) : []
    );
    const skills = Array.isArray(base.skills) ? base.skills : [];
    const projects = Array.isArray(base.projects) ? base.projects : [];

    const normalized = {
        ...base,
        profile: {
            name: typeof profile.name === 'string' ? profile.name : '',
            title: typeof profile.title === 'string' ? profile.title : '',
            greeting: typeof profile.greeting === 'string' ? profile.greeting : '',
            status: typeof profile.status === 'string' ? profile.status : '',
            bio: Array.isArray(profile.bio) ? profile.bio.filter(x => typeof x === 'string') : (typeof profile.bio === 'string' && profile.bio ? [profile.bio] : []),
        },
        contact: contact.filter(c => isPlainObject(c)).map(c => ({
            platform: typeof c.platform === 'string' ? c.platform : '',
            value: typeof c.value === 'string' ? c.value : '',
        })),
        skills: skills
            .filter(s => isPlainObject(s))
            .map(s => ({
                category: typeof s.category === 'string' ? s.category : '',
                items: typeof s.items === 'string' ? s.items : '',
            })),
        projects: projects
            .filter(p => isPlainObject(p))
            .map(p => ({
                id: typeof p.id === 'number' ? p.id : 0,
                title: typeof p.title === 'string' ? p.title : '',
                technologies: Array.isArray(p.technologies) ? p.technologies.filter(t => typeof t === 'string') : [],
                description: typeof p.description === 'string' ? p.description : '',
                images: Array.isArray(p.images)
                    ? p.images.filter(img => isPlainObject(img)).map(img => ({
                        url: typeof img.url === 'string' ? img.url : '',
                        caption: typeof img.caption === 'string' ? img.caption : ''
                    }))
                    : [],
                credentials: isPlainObject(p.credentials) ? {
                    url: typeof p.credentials.url === 'string' ? p.credentials.url : '',
                    username: typeof p.credentials.username === 'string' ? p.credentials.username : '',
                    password: typeof p.credentials.password === 'string' ? p.credentials.password : '',
                    remark: typeof p.credentials.remark === 'string' ? p.credentials.remark : '',
                } : undefined,
            })),
    };

    // Ensure unique IDs for projects
    const maxId = normalized.projects.reduce((m, p) => (typeof p.id === 'number' && p.id > m ? p.id : m), 0);
    let nextId = maxId + 1;
    normalized.projects = normalized.projects.map(p => {
        if (typeof p.id === 'number' && p.id > 0) return p;
        const fixed = { ...p, id: nextId };
        nextId += 1;
        return fixed;
    });

    return normalized;
}

function validateData(data) {
    const arr = [];
    if (!isPlainObject(data)) return ['顶层应为对象'];

    if (!isPlainObject(data.profile)) {
        arr.push('缺少 profile 对象');
    } else {
        if (!data.profile.name) arr.push('profile.name 缺失');
        if (!data.profile.title) arr.push('profile.title 缺失');
        if (data.profile.bio && !Array.isArray(data.profile.bio)) arr.push('profile.bio 应为数组');
    }

    if (!Array.isArray(data.contact)) arr.push('contact 应为数组');
    else {
        data.contact.forEach((c, i) => {
            if (!isPlainObject(c)) arr.push(`contact[${i}] 应为对象`);
            else {
                if (!c.platform) arr.push(`contact[${i}].platform 缺失`);
                if (!c.value) arr.push(`contact[${i}].value 缺失`);
            }
        });
    }

    if (data.skills && !Array.isArray(data.skills)) arr.push('skills 应为数组');

    if (!Array.isArray(data.projects)) {
        arr.push('projects 应为数组');
    } else {
        const ids = new Set();
        data.projects.forEach((p, i) => {
            if (!isPlainObject(p)) {
                arr.push(`projects[${i}] 不是对象`);
                return;
            }
            if (typeof p.id !== 'number') arr.push(`projects[${i}].id 应为数字`);
            if (typeof p.id === 'number') {
                if (ids.has(p.id)) arr.push(`projects[${i}].id 重复：${p.id}`);
                ids.add(p.id);
            }
            if (!p.title || typeof p.title !== 'string') arr.push(`projects[${i}].title 缺失或不是字符串`);
            if (p.technologies && !Array.isArray(p.technologies)) arr.push(`projects[${i}].technologies 应为字符串数组`);
            if (!p.description || typeof p.description !== 'string') arr.push(`projects[${i}].description 缺失或不是字符串`);
            if (p.images && !Array.isArray(p.images)) arr.push(`projects[${i}].images 应为数组`);
            if (p.credentials && !isPlainObject(p.credentials)) arr.push(`projects[${i}].credentials 应为对象`);
        });
    }
    return arr;
}

// --- Components ---

function TextInput({ label, value, onChange, placeholder, type = 'text', icon: Icon }) {
    return (
        <div className="group">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">{label}</label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon size={16} />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${Icon ? 'pl-9' : ''}`}
                />
            </div>
        </div>
    );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
    return (
        <div className="group">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
            />
        </div>
    );
}

function StringListEditor({ title, items, onChange, addText = '新增' }) {
    return (
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">{title}</div>
                <button
                    type="button"
                    onClick={() => onChange([...(items || []), ''])}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus size={14} />
                    {addText}
                </button>
            </div>
            {(items || []).length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-2 border border-dashed border-slate-200 rounded-lg">暂无内容</div>
            ) : (
                <div className="space-y-2">
                    {(items || []).map((v, idx) => (
                        <div key={idx} className="flex gap-2 group">
                            <input
                                value={v}
                                onChange={e => {
                                    const next = [...items];
                                    next[idx] = e.target.value;
                                    onChange(next);
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="删除"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ContactSelector({ onSelect, onClose }) {
    const [custom, setCustom] = useState('');
    const options = [
        { label: '电话 (Phone)', value: 'Phone', icon: Phone },
        { label: '邮箱 (Email)', value: 'Email', icon: Mail },
        { label: '微信 (WeChat)', value: 'WeChat', icon: MessageCircle },
        { label: '领英 (LinkedIn)', value: 'LinkedIn', icon: Linkedin },
        { label: '推特 (Twitter)', value: 'Twitter', icon: Twitter },
        { label: 'GitHub', value: 'GitHub', icon: Github },
        { label: '网站 (Website)', value: 'Website', icon: Globe },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">选择联系方式</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-2 max-h-[320px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2 p-2">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onSelect(opt.value)}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 transition-all group"
                            >
                                <opt.icon size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <span className="text-xs font-medium">{opt.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-2 pt-0">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400">或自定义</span>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                placeholder="输入自定义名称..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && custom.trim()) {
                                        onSelect(custom.trim());
                                    }
                                }}
                            />
                            <button
                                onClick={() => custom.trim() && onSelect(custom.trim())}
                                disabled={!custom.trim()}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function EditPage() {
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('auth') === 'true';
    });
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const issues = useMemo(() => validateData(data), [data]);
    const canSave = data && issues.length === 0;

    const fetchData = useCallback(() => {
        fetch(`/api/projects?t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then(json => {
                const normalized = normalizeData(json);
                setData(normalized);
                setSelectedProjectId(prev => (prev === null && normalized.projects.length > 0 ? normalized.projects[0].id : prev));
            })
            .catch(err => {
                setStatus('Error loading data: ' + (err instanceof Error ? err.message : '加载失败'));
            });
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, fetchData]);

    const handleSave = useCallback(async () => {
        if (!data) return;
        if (issues.length > 0) {
            setStatus('存在校验问题，已阻止保存');
            setTimeout(() => setStatus(''), 2000);
            return;
        }
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            setStatus('Saved successfully!');
            setTimeout(() => setStatus(''), 3000);
            fetchData();
        } else {
            setStatus('Error saving data');
        }
    }, [data, issues, fetchData]);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [handleSave]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                localStorage.setItem('auth', 'true');
                setStatus('');
            } else {
                setStatus('Incorrect password');
            }
        } catch {
            setStatus('Login failed');
        }
    };

    const handleInsertProjectTemplate = () => {
        if (!data) return;
        const next = cloneJson(data);
        const maxId = next.projects.reduce((m, p) => (typeof p.id === 'number' && p.id > m ? p.id : m), 0);
        const nextId = maxId + 1;
        const tmpl = {
            id: nextId,
            title: '新项目名称',
            technologies: ['Tech1', 'Tech2'],
            description: '在此填写项目描述',
            images: [],
            credentials: { url: '', username: '', password: '', remark: '' }
        };
        next.projects = [...(Array.isArray(next.projects) ? next.projects : []), tmpl];
        setData(next);
        setSelectedProjectId(nextId);
        setActiveTab('projects');
        setStatus('已新增项目');
        setTimeout(() => setStatus(''), 1500);
    };

    const updateData = useCallback((updater) => {
        setData(prev => {
            const base = normalizeData(prev || {});
            const next = cloneJson(base);
            updater(next);
            return next;
        });
    }, []);

    const effectiveSelectedProjectId = useMemo(() => {
        if (!data || !Array.isArray(data.projects) || data.projects.length === 0) return null;
        if (selectedProjectId !== null && data.projects.some(p => p.id === selectedProjectId)) return selectedProjectId;
        return data.projects[0].id;
    }, [data, selectedProjectId]);

    const selectedProject = useMemo(() => {
        if (!data || !Array.isArray(data.projects)) return null;
        const found = data.projects.find(p => p.id === effectiveSelectedProjectId) || null;
        return found;
    }, [data, effectiveSelectedProjectId]);

    const fileInputRef = useRef(null);
    const [jsonCopied, setJsonCopied] = useState(false);

    const handleImportJson = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                const normalized = normalizeData(json);
                setData(normalized);
                setStatus('导入成功');
                setTimeout(() => setStatus(''), 2000);
            } catch (err) {
                setStatus('JSON 解析失败');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    };

    const handleExportJson = () => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('已导出文件');
        setTimeout(() => setStatus(''), 2000);
    };

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setJsonCopied(true);
        setTimeout(() => setJsonCopied(false), 2000);
        setStatus('已复制到剪贴板');
        setTimeout(() => setStatus(''), 2000);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-slate-100">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <User size={24} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">管理员登录</h1>
                    <p className="text-slate-500 text-sm text-center mb-8">请输入您的访问密钥以继续</p>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="输入密钥"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                        <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20">
                            登录系统
                        </button>
                    </form>
                    {status && (
                        <div className="flex items-center gap-2 mt-4 text-red-500 text-sm justify-center bg-red-50 py-2 rounded-lg">
                            <AlertCircle size={16} />
                            <span>{status}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {showContactSelector && (
                <ContactSelector
                    onSelect={(platform) => {
                        updateData(d => { d.contact.push({ platform, value: '' }); });
                        setShowContactSelector(false);
                    }}
                    onClose={() => setShowContactSelector(false)}
                />
            )}
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 mb-8">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                            <LayoutGrid size={18} />
                        </div>
                        <h1 className="text-lg font-bold text-slate-800">CMS 控制台</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                            <Home size={16} />
                            <span>返回首页</span>
                        </a>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('auth');
                                setIsAuthenticated(false);
                                setData(null);
                            }} 
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={16} />
                            <span>退出</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200 p-4">
                        <div className="space-y-1">
                            {[
                                { key: 'profile', label: '个人信息', icon: User },
                                { key: 'skills', label: '技能特长', icon: Code },
                                { key: 'contact', label: '联系方式', icon: Mail },
                                { key: 'projects', label: '项目经历', icon: Briefcase },
                                { key: 'json', label: '数据管理', icon: FileJson },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        activeTab === t.key 
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 translate-x-1' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                                    }`}
                                >
                                    <t.icon size={18} className={`transition-colors ${activeTab === t.key ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-8 px-4 space-y-3">
                            <button
                                onClick={handleSave}
                                disabled={!canSave}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    canSave 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98]' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {canSave ? <Save size={18} /> : <Loader2 size={18} className="animate-spin" />}
                                <span>保存更改</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('确定要还原所有更改吗？未保存的内容将丢失。')) {
                                        window.location.reload();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm"
                            >
                                <RotateCcw size={18} />
                                <span>还原更改</span>
                            </button>
                            {status && (
                                <div className={`mt-3 text-xs text-center py-2 rounded-lg ${
                                    status.includes('success') || status.includes('已') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                    {status}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto max-h-[calc(100vh-140px)]">
                        {!data ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Loader2 size={32} className="animate-spin mb-2" />
                                <span className="text-sm">正在加载数据...</span>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {activeTab === 'profile' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 mb-1">基本资料</h2>
                                            <p className="text-sm text-slate-500 mb-6">设置您的个人身份信息，这些将显示在首页顶部。</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <TextInput
                                                    label="欢迎语"
                                                    value={data.profile.greeting}
                                                    onChange={(v) => updateData(d => { d.profile.greeting = v; })}
                                                    placeholder="例如：你好，我是"
                                                    icon={Sparkles}
                                                />
                                                <TextInput
                                                    label="姓名"
                                                    value={data.profile.name}
                                                    onChange={(v) => updateData(d => { d.profile.name = v; })}
                                                    placeholder="例如：小王"
                                                    icon={User}
                                                />
                                                <TextInput
                                                    label="头衔"
                                                    value={data.profile.title}
                                                    onChange={(v) => updateData(d => { d.profile.title = v; })}
                                                    placeholder="例如：资深 Java 开发工程师"
                                                    icon={Briefcase}
                                                />
                                                <TextInput
                                                    label="当前状态"
                                                    value={data.profile.status}
                                                    onChange={(v) => updateData(d => { d.profile.status = v; })}
                                                    placeholder="例如：寻求更具挑战性的机会"
                                                    icon={AlertCircle}
                                                />
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-100 pt-8">
                                            <h2 className="text-lg font-bold text-slate-800 mb-1">个人简介</h2>
                                            <p className="text-sm text-slate-500 mb-6">简短介绍您的背景和专长。</p>
                                            <StringListEditor
                                                title="简介段落"
                                                items={data.profile.bio}
                                                onChange={(nextBio) => updateData(d => { d.profile.bio = nextBio; })}
                                                addText="新增段落"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800">技能清单</h2>
                                                <p className="text-sm text-slate-500">展示您的技术栈和专业能力。</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateData(d => { d.skills.push({ category: '', items: '' }); })}
                                                className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20"
                                            >
                                                <Plus size={16} />
                                                新增分类
                                            </button>
                                        </div>
                                        
                                        {data.skills.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <Code size={48} className="mx-auto text-slate-300 mb-3" />
                                                <p className="text-slate-500 text-sm">暂无技能，点击右上角按钮添加。</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {data.skills.map((s, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateData(d => { d.skills.splice(idx, 1); })}
                                                            className="absolute top-4 right-4 text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="删除此分类"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-1 gap-4 pr-10">
                                                            <TextInput
                                                                label="分类名称"
                                                                value={s.category}
                                                                onChange={(v) => updateData(d => { d.skills[idx].category = v; })}
                                                                placeholder="例如：后端开发"
                                                                icon={Code}
                                                            />
                                                            <TextArea
                                                                label="技能项（逗号分隔）"
                                                                value={s.items}
                                                                onChange={(v) => updateData(d => { d.skills[idx].items = v; })}
                                                                placeholder="Java, Spring Boot, MySQL..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'contact' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800">联系方式</h2>
                                                <p className="text-sm text-slate-500">添加多种联系方式，让招聘者更容易联系到您。</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowContactSelector(true)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20"
                                            >
                                                <Plus size={16} />
                                                新增方式
                                            </button>
                                        </div>

                                        {data.contact.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                <Mail size={48} className="mx-auto text-slate-300 mb-3" />
                                                <p className="text-slate-500 text-sm">暂无联系方式，点击右上角按钮添加。</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4">
                                                {data.contact.map((c, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group relative">
                                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                                            <Mail size={20} />
                                                        </div>
                                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <TextInput
                                                                label="平台/方式"
                                                                value={c.platform}
                                                                onChange={(v) => updateData(d => { d.contact[idx].platform = v; })}
                                                                placeholder="例如：Phone, Email, WeChat"
                                                            />
                                                            <TextInput
                                                                label="联系号码/链接"
                                                                value={c.value}
                                                                onChange={(v) => updateData(d => { d.contact[idx].value = v; })}
                                                                placeholder="例如：13800138000"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateData(d => { d.contact.splice(idx, 1); })}
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="删除"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'json' && (
                                    <div className="h-full flex flex-col space-y-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800">数据管理</h2>
                                            <p className="text-sm text-slate-500">导入、导出或查看原始 JSON 数据。</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".json"
                                                onChange={handleImportJson}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                            >
                                                <Upload size={16} />
                                                导入 JSON
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleExportJson}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"
                                            >
                                                <Download size={16} />
                                                导出 JSON
                                            </button>
                                            <div className="flex-1"></div>
                                            <button
                                                type="button"
                                                onClick={handleCopyJson}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
                                            >
                                                {jsonCopied ? <Check size={16} /> : <Copy size={16} />}
                                                {jsonCopied ? '已复制' : '复制 JSON'}
                                            </button>
                                        </div>

                                        <div className="flex-1 flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner min-h-[400px]">
                                            <div className="h-8 bg-slate-800 flex items-center px-4 border-b border-slate-700 justify-between shrink-0">
                                                <span className="text-xs text-slate-400 font-mono">projects.json</span>
                                                <span className="text-[10px] text-slate-500 font-mono">{JSON.stringify(data).length} bytes</span>
                                            </div>
                                            <textarea
                                                readOnly
                                                value={JSON.stringify(data, null, 2)}
                                                className="flex-1 w-full p-4 bg-slate-900 text-slate-300 font-mono text-xs outline-none resize-none focus:ring-0 border-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'projects' && (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800">项目展示</h2>
                                                <p className="text-sm text-slate-500">管理您的作品集项目。</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleInsertProjectTemplate}
                                                className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20"
                                            >
                                                <Plus size={16} />
                                                新增项目
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                            {/* Project List */}
                                            <div className="lg:col-span-1 bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-y-auto max-h-[600px]">
                                                {data.projects.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-400 text-sm">暂无项目</div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {data.projects.map(p => (
                                                            <button
                                                                key={p.id}
                                                                type="button"
                                                                onClick={() => setSelectedProjectId(p.id)}
                                                                className={`w-full text-left rounded-lg px-3 py-3 text-sm transition-all group relative ${
                                                                    p.id === effectiveSelectedProjectId 
                                                                    ? 'bg-white shadow-sm ring-1 ring-blue-500/20 z-10' 
                                                                    : 'hover:bg-white/60 hover:shadow-sm text-slate-600'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className={`font-medium truncate ${p.id === effectiveSelectedProjectId ? 'text-blue-600' : 'text-slate-700'}`}>
                                                                        {p.title || '未命名项目'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-slate-400 truncate flex items-center gap-2">
                                                                    <span className="bg-slate-200/50 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono">ID:{p.id}</span>
                                                                    <span className="truncate">{(p.technologies || []).join(' · ') || '无技术标签'}</span>
                                                                </div>
                                                                {p.id === effectiveSelectedProjectId && (
                                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500">
                                                                        <ChevronRight size={16} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Editor */}
                                            <div className="lg:col-span-2 space-y-6 pb-12">
                                                {!selectedProject ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-8">
                                                        <Sparkles size={32} className="text-slate-300 mb-2" />
                                                        <p>请选择左侧项目进行编辑</p>
                                                    </div>
                                                ) : (
                                                    <div className="animate-in fade-in duration-300 space-y-6">
                                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-xs text-slate-600">ID: {selectedProject.id}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (!data) return;
                                                                    const idx = data.projects.findIndex(p => p.id === selectedProject.id);
                                                                    if (idx < 0) return;
                                                                    const next = cloneJson(data);
                                                                    next.projects.splice(idx, 1);
                                                                    setData(next);
                                                                    setStatus('已删除项目');
                                                                    setTimeout(() => setStatus(''), 1500);
                                                                }}
                                                                className="flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100 bg-white hover:border-red-200"
                                                            >
                                                                <Trash2 size={14} />
                                                                删除项目
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            <TextInput
                                                                label="项目名称"
                                                                value={selectedProject.title}
                                                                onChange={(v) => updateData(d => {
                                                                    const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                    if (idx >= 0) d.projects[idx].title = v;
                                                                })}
                                                                placeholder="例如：极速秒杀系统"
                                                                icon={Briefcase}
                                                            />
                                                            <TextInput
                                                                label="ID (数字)"
                                                                value={String(selectedProject.id)}
                                                                onChange={(v) => {
                                                                    const num = Number(v);
                                                                    if (!Number.isFinite(num)) return;
                                                                    updateData(d => {
                                                                        const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                        if (idx >= 0) d.projects[idx].id = num;
                                                                    });
                                                                    setSelectedProjectId(num);
                                                                }}
                                                                type="number"
                                                                icon={Code}
                                                            />
                                                        </div>

                                                        <StringListEditor
                                                            title="技术栈标签"
                                                            items={selectedProject.technologies}
                                                            onChange={(nextTech) => updateData(d => {
                                                                const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                if (idx >= 0) d.projects[idx].technologies = nextTech;
                                                            })}
                                                            addText="添加标签"
                                                        />

                                                        <TextArea
                                                            label="项目描述"
                                                            value={selectedProject.description}
                                                            onChange={(v) => updateData(d => {
                                                                const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                if (idx >= 0) d.projects[idx].description = v;
                                                            })}
                                                            placeholder="详细描述项目的背景、难点与成果..."
                                                            rows={6}
                                                        />

                                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                                    <ImageIcon size={16} className="text-blue-500" />
                                                                    项目截图
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateData(d => {
                                                                        const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                        if (idx >= 0) d.projects[idx].images.push({ url: '', caption: '' });
                                                                    })}
                                                                    className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                                                                >
                                                                    + 添加图片
                                                                </button>
                                                            </div>
                                                            
                                                            {selectedProject.images.length === 0 ? (
                                                                <div className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center gap-2">
                                                                    <ImageIcon size={24} className="text-slate-300" />
                                                                    <span>暂无图片，点击上方按钮添加</span>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {selectedProject.images.map((img, imgIdx) => (
                                                                        <div key={imgIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group hover:border-blue-200 hover:shadow-sm transition-all">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateData(d => {
                                                                                    const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                                    if (idx >= 0) d.projects[idx].images.splice(imgIdx, 1);
                                                                                })}
                                                                                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100"
                                                                                title="删除图片"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                            <div className="grid gap-3">
                                                                                <TextInput
                                                                                    label="图片 URL"
                                                                                    value={img.url}
                                                                                    onChange={(v) => updateData(d => {
                                                                                        const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                                        if (idx >= 0) d.projects[idx].images[imgIdx].url = v;
                                                                                    })}
                                                                                    placeholder="https://..."
                                                                                    icon={LinkIcon}
                                                                                />
                                                                                <TextInput
                                                                                    label="说明文字"
                                                                                    value={img.caption}
                                                                                    onChange={(v) => updateData(d => {
                                                                                        const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                                        if (idx >= 0) d.projects[idx].images[imgIdx].caption = v;
                                                                                    })}
                                                                                    placeholder="例如：系统架构图"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                                    <User size={16} className="text-blue-500" />
                                                                    演示账号
                                                                </div>
                                                                {!selectedProject.credentials ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateData(d => {
                                                                            const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                            if (idx >= 0) d.projects[idx].credentials = { url: '', username: '', password: '', remark: '' };
                                                                        })}
                                                                        className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 flex items-center gap-1"
                                                                    >
                                                                        <Plus size={14} />
                                                                        启用配置
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateData(d => {
                                                                            const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                            if (idx >= 0) d.projects[idx].credentials = undefined;
                                                                        })}
                                                                        className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100 flex items-center gap-1"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        移除配置
                                                                    </button>
                                                                )}
                                                            </div>
                                                            
                                                            {selectedProject.credentials && (
                                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                                                                    <TextInput
                                                                        label="演示地址"
                                                                        value={selectedProject.credentials.url || ''}
                                                                        onChange={(v) => updateData(d => {
                                                                            const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                            if (idx >= 0 && d.projects[idx].credentials) d.projects[idx].credentials.url = v;
                                                                        })}
                                                                        placeholder="https://..."
                                                                        icon={LinkIcon}
                                                                    />
                                                                    <TextInput
                                                                        label="备注"
                                                                        value={selectedProject.credentials.remark || ''}
                                                                        onChange={(v) => updateData(d => {
                                                                            const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                            if (idx >= 0 && d.projects[idx].credentials) d.projects[idx].credentials.remark = v;
                                                                        })}
                                                                        placeholder="例如：仅供查看"
                                                                    />
                                                                    <TextInput
                                                                        label="用户名"
                                                                        value={selectedProject.credentials.username || ''}
                                                                        onChange={(v) => updateData(d => {
                                                                            const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                            if (idx >= 0 && d.projects[idx].credentials) d.projects[idx].credentials.username = v;
                                                                        })}
                                                                        placeholder="admin"
                                                                        icon={User}
                                                                    />
                                                                    <TextInput
                                                                        label="密码"
                                                                        value={selectedProject.credentials.password || ''}
                                                                        onChange={(v) => updateData(d => {
                                                                            const idx = d.projects.findIndex(p => p.id === selectedProject.id);
                                                                            if (idx >= 0 && d.projects[idx].credentials) d.projects[idx].credentials.password = v;
                                                                        })}
                                                                        placeholder="******"
                                                                        type="text"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <footer className="mt-8 text-center text-xs text-slate-400 pb-8">
                    &copy; {new Date().getFullYear()} Minimalist Portfolio CMS
                </footer>
            </div>
        </div>
    );
}
