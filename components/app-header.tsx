"use client"

import { LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

export function AppHeader() {
  const { logout } = useAuth()

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
      logout()
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-quilombo-orange/20 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-quilombo-orange" />
          <span className="text-sm font-medium text-quilombo-green">Sistema Protegido</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-quilombo-orange/30 hover:border-quilombo-orange">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
