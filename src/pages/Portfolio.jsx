import { useState, useEffect } from 'react'
import { LayoutGrid, List, Mail, ExternalLink } from 'lucide-react'
import ProjectModal from '../components/ProjectModal'
import ContactModal from '../components/ContactModal'
import ImageCarousel from '../components/ImageCarousel'

function Portfolio() {
  const [viewMode, setViewMode] = useState('grid') // 'list' or 'grid'
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState({})
  const [skills, setSkills] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '' })
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  useEffect(() => {
    // 从 API 获取数据以确保是最新的并避免缓存
    fetch(`/api/projects?t=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Backward compatibility in case file hasn't updated in cache or similar
          setProjects(data)
        } else {
          setProjects(data.projects || [])
          setProfile(data.profile || {})
          setSkills(data.skills || [])
          if (data.contact) {
            setContactInfo(data.contact)
          }
        }
      })
      .catch(error => console.error('Error loading projects:', error))
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full bg-[#F5F5F7]/80 backdrop-blur-md z-50 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">Portfolio</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">{profile.status}</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
             {/* View Toggle */}
            <div className="flex items-center bg-gray-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => setIsContactModalOpen(true)} 
              className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              联系我
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="mb-10 sm:mb-12">
            <div className="w-full">
              <div className="flex flex-col gap-4 mb-10">
                <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  {profile.greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{profile.name}</span>
                  <span className="inline-block ml-4 origin-bottom hover:animate-bounce cursor-default">👋</span>
                </h1>
                <p className="text-2xl sm:text-3xl text-gray-500 font-medium max-w-3xl">
                  {profile.title}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-base text-gray-600 leading-relaxed">
                {profile.bio && profile.bio.map((item, index) => {
                  const parts = item.split(/[:：]/);
                  const hasTitle = parts.length > 1;
                  return (
                    <div key={index} className="flex flex-col gap-1">
                      {hasTitle ? (
                        <>
                          <span className="font-bold text-gray-900 text-lg">{parts[0]}</span>
                          <span>{parts.slice(1).join('：')}</span>
                        </>
                      ) : (
                        <span>{item}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">技能/专长</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-blue-600 mb-2">{skill.category}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{skill.items}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Projects Container */}
          <div className={viewMode === 'list' ? 'space-y-24' : 'grid grid-cols-1 md:grid-cols-2 gap-8'}>
            {projects.map((project) => (
              <article 
                key={project.id} 
                className={`group ${viewMode === 'grid' ? 'bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col' : ''}`}
              >
                {viewMode === 'list' ? (
                  // LIST VIEW LAYOUT
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] mb-3">
                          {project.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies && project.technologies.map((tech, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shadow-2xl shadow-gray-200/50 rounded-2xl bg-white p-2">
                      <ImageCarousel images={project.images} title={project.title} />
                    </div>

                    {/* Adjusted text container to match image width */}
                    <div className="w-full">
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {project.description}
                      </p>
                      {project.credentials && (
                        <div className="mt-6 flex justify-end">
                          <button 
                            onClick={() => setSelectedProject(project)}
                            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors group/link"
                          >
                            访问项目
                            <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // GRID VIEW LAYOUT
                  <>
                    <div className="w-full">
                      <ImageCarousel images={project.images} title={project.title} compact={true} />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.technologies && project.technologies.map((tech, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                        {project.description}
                      </p>
                      {project.credentials && (
                        <button 
                          onClick={() => setSelectedProject(project)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors mt-auto self-end"
                        >
                          访问项目
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          {/* <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a>
          </div> */}
        </div>
      </footer>
      {/* Project Modal */}
      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
      
      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactInfo={contactInfo}
      />
    </div>
  )
}

export default Portfolio
