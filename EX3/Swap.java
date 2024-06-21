/*============================================================================*/
/* Swap numbers program                                                       */
/*----------------------------------------------------------------------------*/
/* Author: Daniel Zaki Sommer                                                 */
/* Github: https://github.com/danisommer                                      */
/* Telephone: +55 (41) 99708-5707                                             */
/* Email: danielsommer@alunos.utfpr.edu.br                                    */
/* LinkedIn: www.linkedin.com/in/danisommer                                   */
/*============================================================================*/
/* This program performs swapping of values between two variables without     */
/* using a temporary variable.                                                */
/*============================================================================*/

public class Swap {
    public static void main (String[] args){
        int x = -90, y = 45;

        x = x + y;
        y = x - y;
        x = x - y;

        System.out.println("Results: x = " + x + ", y = " + y);
    }
}
