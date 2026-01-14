import { Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <div>
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
          MedBook
        </Link>
      </header>

      <main style={{ padding: '2rem' }}>
        <Routes>
          {/* TODO: Add your routes here */}
          {/* <Route path="/" element={<DoctorListPage />} /> */}
          {/* <Route path="/doctors/:id" element={<DoctorDetailPage />} /> */}
          {/* <Route path="/doctor/:doctorId" element={<DoctorDashboard />} /> */}

          <Route path="/" element={<Placeholder />} />
        </Routes>
      </main>
    </div>
  )
}

function Placeholder() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Welcome to MedBook!</h1>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        Your task is to build an appointment booking platform.
      </p>

      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'left' }}>
        <h3>Getting Started:</h3>
        <ol style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
          <li>Implement the backend API endpoints in <code>server/</code></li>
          <li>Create the Doctor list page (patient view)</li>
          <li>Create the Doctor detail page with booking form</li>
          <li>Create the Doctor dashboard (doctor view)</li>
          <li>Style the application</li>
        </ol>

        <p style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px', fontSize: '0.9rem' }}>
          <strong>Tip:</strong> Check the README.md for full requirements and types in <code>src/types/index.ts</code>
        </p>
      </div>
    </div>
  )
}

export default App
