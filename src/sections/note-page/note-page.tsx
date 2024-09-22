"use client"

import { useState, useEffect } from 'react'
import { PlusCircle, File, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import WithBaseFullSetup from '@/components/editor/editor'


interface Page {
  id: string
  title: string
  content: string
}

export default function NotePage() {
  const [pages, setPages] = useState<Page[]>([
    { id: '1', title: 'Welcome', content: '# Welcome to Your Notion-like Notes\n\nThis is a simple Notion-like notes application. You can:\n\n- Create new pages\n- Edit page content directly\n- Use Markdown syntax for formatting\n\n## Example List\n\n- Item 1\n- Item 2\n- Item 3\n\n## Example Checklist\n\n- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3\n\n## Example Code Block\n\n```javascript\nconsole.log("Hello, World!");\n```\n\nEnjoy taking notes!' }
  ])
  const [currentPage, setCurrentPage] = useState<Page>(pages[0])
  const [newPageTitle, setNewPageTitle] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        setSelectedTab(prev => prev === "write" ? "preview" : "write")
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addNewPage = () => {
    if (newPageTitle.trim() === '') return
    const newPage: Page = {
      id: Date.now().toString(),
      title: newPageTitle,
      content: `# ${newPageTitle}\n\nStart writing your notes here...`
    }
    setPages([...pages, newPage])
    setNewPageTitle('')
    setCurrentPage(newPage)
  }

  const updatePageContent = (content: string) => {
    const updatedPages = pages.map(page =>
      page.id === currentPage.id ? { ...page, content } : page
    )
    setPages(updatedPages)
    setCurrentPage({ ...currentPage, content })
  }

  return (
    <div className="flex h-screen bg-white"> 
      {/* Sidebar */}
      <div className={`bg-gray-100 ${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mb-4"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {isSidebarOpen && (
            <>
              <div className="flex items-center mb-4">
                <Input
                  type="text"
                  placeholder="New page title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="mr-2"
                />
                <Button onClick={addNewPage} size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <nav>
                {pages.map(page => (
                  <Button
                    key={page.id}
                    variant="ghost"
                    className={`w-full justify-start mb-1 ${currentPage.id === page.id ? 'bg-gray-200' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    <File className="mr-2 h-4 w-4" />
                    {page.title}
                  </Button>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <WithBaseFullSetup />
      </div>
    </div>
  )
}