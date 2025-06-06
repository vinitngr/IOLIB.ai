import { generateToken } from "../configs/utils";
import { z } from "zod";
import { loginUser , registerUser } from "../service/auth.service";


export const register = async (req: any, res: any) => {
  const { fullName, email, password , profession} = req.body;

  const Schema = z.object({
    fullName: z.string().min(3, { message: "Name must be at least 3 characters long" }),
    email: z.string().email().regex(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)$/,
      "Invalid email domain. Only Gmail, Hotmail, Outlook, and Yahoo are allowed."
    ),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });

  const validation = Schema.safeParse({ fullName, email, password , profession });
  if (!validation.success) {
    return res.status(400).json({ message: validation.error.errors[0].message });
  }

  try {
    const userData = await registerUser(fullName, email, password );
    const token = generateToken(userData._id , res);
    res.status(201).json({...userData , token});
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  const Schema = z.object({
    email: z.string().email().regex(
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)$/,
      "Invalid email domain. Only Gmail, Hotmail, Outlook, and Yahoo are allowed."
    ),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });

  const validation = Schema.safeParse({ email, password });
  if (!validation.success) {
    return res.status(400).json({ message: validation.error.errors });
  }

  try {
    const userData = await loginUser(email, password);
    const token = generateToken(userData._id , res);
    res.status(200).json({...userData , token});
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (_req : any , res : any) => {
  try{
    res.clearCookie("langchain");
    res.status(200).json({ message: "Logout successful" });
  }catch(error){
    console.log("Error while logging out", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (_req : any , res : any) => {
  try {
    res.status(200).json(res.locals.user);
  } catch (error) {   
    console.log("Error while checking auth", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
