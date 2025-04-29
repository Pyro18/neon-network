"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function TestAuthPage() {
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)

  // Function to test if Supabase connection is working 
  const testConnection = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      setOutput("Testing Supabase connection...\n")
      
      // Test basic query
      const { data, error } = await supabase.from('_test').select('*').limit(1).maybeSingle()
      
      if (error) {
        setOutput(prev => prev + `Connection error: ${error.message}\n`)
      } else {
        setOutput(prev => prev + `Connection successful! Data response: ${JSON.stringify(data)}\n`)
      }
      
      // Test Auth API version
      const { data: authData, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        setOutput(prev => prev + `Auth API error: ${authError.message}\n`)
      } else {
        setOutput(prev => prev + `Auth API working! Session exists: ${!!authData.session}\n`)
      }
      
    } catch (error) {
      setOutput(prev => prev + `Unexpected error: ${error}\n`)
    } finally {
      setLoading(false)
    }
  }
  
  // Try an anonymous signup with minimal data
  const testSignUp = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      setOutput("Testing signup with minimal data...\n")
      
      // Create random email
      const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`
      const password = "Password123!"
      
      const { data, error } = await supabase.auth.signUp({
        email: randomEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setOutput(prev => prev + `Signup error: ${error.message}\n`)
        setOutput(prev => prev + `Error details: ${JSON.stringify({
          status: error.status,
          name: error.name
        })}\n`)
      } else {
        setOutput(prev => prev + `Signup successful! User ID: ${data?.user?.id}\n`)
        setOutput(prev => prev + `Email: ${randomEmail}\n`)
      }
      
    } catch (error) {
      setOutput(prev => prev + `Unexpected error: ${error}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Auth Test</h1>
      
      <div className="flex space-x-4 mb-4">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Connection"}
        </Button>
        
        <Button onClick={testSignUp} disabled={loading} variant="secondary">
          {loading ? "Testing..." : "Test Signup"}
        </Button>
      </div>
      
      <div className="bg-black/10 p-4 rounded-md">
        <pre className="whitespace-pre-wrap text-sm">
          {output || "Click a button to test Supabase functionality"}
        </pre>
      </div>
    </div>
  )
} 