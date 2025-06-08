// Questa pagina serve per testare la connessione a Supabase e la configurazione di Discord OAuth
// potete anche toglierla in produzione se non vi serve
"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function TestConnectionPage() {
    const [results, setResults] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const addResult = (message: string, isError = false) => {
        const timestamp = new Date().toLocaleTimeString()
        const formattedMessage = `${timestamp}: ${isError ? '❌' : '✅'} ${message}`
        setResults(prev => [...prev, formattedMessage])
        console.log(formattedMessage)
    }

    const testConnection = async () => {
        setIsLoading(true)
        setResults([])

        try {
            addResult('Starting connection tests...')

            // Test 1: Basic connection
            addResult('Testing basic connection...')
            const { data: healthCheck, error: healthError } = await supabase
                .from('auth.users')
                .select('count')
                .limit(1)

            if (healthError) {
                addResult(`Basic connection failed: ${healthError.message}`, true)
            } else {
                addResult('Basic connection successful')
            }

            // Test 2: Auth config
            addResult('Testing auth configuration...')
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError) {
                addResult(`Auth config test failed: ${userError.message}`, true)
            } else {
                addResult(`Auth config successful - Current user: ${user ? user.email : 'None'}`)
            }

            // Test 3: Simple query
            addResult('Testing simple query...')
            const { data: simpleQuery, error: queryError } = await supabase
                .rpc('version')

            if (queryError) {
                addResult(`Simple query failed: ${queryError.message}`, true)
            } else {
                addResult('Simple query successful')
            }

            // Test 4: Check project settings
            addResult('Checking project configuration...')
            addResult(`Project URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
            addResult(`Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...`)

        } catch (error) {
            addResult(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`, true)
        } finally {
            setIsLoading(false)
        }
    }

    const testDiscordAuth = async () => {
        setIsLoading(true)
        addResult('Testing Discord OAuth configuration...')

        try {
            // This will show us if Discord is properly configured
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    skipBrowserRedirect: true, // Don't actually redirect, just test config
                }
            })

            if (error) {
                addResult(`Discord OAuth config error: ${error.message}`, true)
            } else {
                addResult('Discord OAuth configuration appears valid')
                if (data.url) {
                    addResult(`Discord auth URL generated: ${data.url.substring(0, 50)}...`)
                }
            }
        } catch (error) {
            addResult(`Discord test failed: ${error instanceof Error ? error.message : 'Unknown'}`, true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>

            <div className="grid gap-4 mb-8">
                <button
                    onClick={testConnection}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary/20 rounded-md border border-primary/50 text-primary disabled:opacity-50"
                >
                    {isLoading ? 'Testing...' : 'Test Database Connection'}
                </button>

                <button
                    onClick={testDiscordAuth}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500/20 rounded-md border border-blue-500/50 text-blue-500 disabled:opacity-50"
                >
                    {isLoading ? 'Testing...' : 'Test Discord OAuth Config'}
                </button>
            </div>

            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.length === 0 ? (
                        <p className="text-muted-foreground">Click a test button to begin...</p>
                    ) : (
                        results.map((result, index) => (
                            <div key={index} className="text-sm font-mono p-2 bg-background/30 rounded">
                                {result}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h3 className="font-semibold text-amber-500 mb-2">Environment Check:</h3>
                <div className="space-y-1 text-sm">
                    <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
                    <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
                </div>
            </div>
        </div>
    )
}