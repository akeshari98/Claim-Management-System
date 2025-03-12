import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    // Create default insurer if not exists
    this.createDefaultInsurer();
  }

  private async createDefaultInsurer() {
    try {
      const existingInsurer = await this.userModel.findOne({ email: 'akeshari986@gmail.com' });
      if (!existingInsurer) {
        const hashedPassword = await bcrypt.hash('ayush_123', 10);
        await this.userModel.create({
          name: 'Ayush Keshari',
          email: 'akeshari986@gmail.com',
          password: hashedPassword,
          role: 'insurer'
        });
        console.log('Default insurer created');
      }
    } catch (error) {
      console.error('Error creating default insurer:', error);
    }
  }

  async signup(userData: { name: string; email: string; password: string }) {
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userModel.create({
      ...userData,
      password: hashedPassword,
      role: 'patient' // Default role for new signups
    });

    return { message: 'User created successfully' };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'your-secret-key', // Move to environment variables in production
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async getUserById(id: string) {
    return this.userModel.findById(id).select('-password');
  }
} 