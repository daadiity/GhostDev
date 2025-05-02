import projectModel from '../models/project.model.js';

export const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required');
    }
    if (!userId) {
        throw new Error('UserId is required');
    }

    try {
        const project = await projectModel.create({
            name, users: [userId]
        });

        return project;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error; // Re-throw other errors
    }
};
