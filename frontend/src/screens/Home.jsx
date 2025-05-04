import React, { useContext,useState} from 'react';
import { UserContext } from '../context/user.context';
import axios from "../config/axios"
const Home = () => {
 
  const { user } = useContext(UserContext)
  const [ isModalOpen, setIsModalOpen ] = useState(false)

  const [ projectName, setProjectName ] = useState(null)
  function createProject(e) {
    e.preventDefault(); 
  
    axios.post('/projects/create', {
      name: projectName,
    })
    .then((res) => {
      console.log(res);
      setIsModalOpen(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }


  return (
    <main className='p-4'>
      <div className="projects">
        <div className="project">
          <button 
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-300 round-md">
        
        New Project
      
          <i className="ri-link ml-2"></i>
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form
          onSubmit={
            createProject
          }
        >
          <div className="mb-4">
            <label
          htmlFor="projectName"
          className="block text-sm font-medium text-gray-700"
            >
          Project Name
            </label>
            <input

           onChange={(e) => setProjectName(e.target.value)}
           value={projectName}
          type="text"
          id="projectName"
          name="projectName"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
            />
          </div>
          <div className="flex justify-end">
            <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
            >
          Cancel
            </button>
            <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
          Create
            </button>
          </div>
        </form>
          </div>
        </div>
      )}
     

    </main>
  );
};

export default Home;
