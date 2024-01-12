import logo from './logo.svg';
import './App.css';
import {Routes, Route, Navigate} from 'react-router-dom';

function App() {
  return (
   <Routes>
      <Route path="/" element={<h1>home page</h1>}/>
      <Route path="/posts" element={<h1>posts list page</h1>}/>
      <Route path="/posts/:id" element={<h1>post detail page</h1>}/>
      <Route path="/posts/new" element={<h1>post new page</h1>}/>
      <Route path="/posts/edit/:id" element={<h1>post edit page</h1>}/>
      <Route path="/profile" element={<h1>profile page</h1>}/>
      <Route path="/profile/edit" element={<h1>profil edit page</h1>}/>
      <Route path="/notification" element={<h1>notification page</h1>}/>
      <Route path="/search" element={<h1>search page</h1>}/>
      <Route path="/users/login" element={<h1>login page</h1>}/>
      <Route path="/users/signup" element={<h1>sign up page</h1>}/>
      <Route path="*" element={<Navigate replace to="/"/>}/>
   </Routes>
  );
}

export default App;
