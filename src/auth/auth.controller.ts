import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/signup.dto";


@Controller("auth")
export class AuthController {

  constructor(
    private authService: AuthService
  ) {
  }


  // Register User
  @Post("/signup")
  async signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
  }


  // Login user
  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }

}
