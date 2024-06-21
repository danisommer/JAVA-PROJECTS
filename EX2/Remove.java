/*============================================================================*/
/* Remove white spaces program                                                */
/*----------------------------------------------------------------------------*/
/* Author: Daniel Zaki Sommer                                                 */
/* Github: https://github.com/danisommer                                      */
/* Telephone: +55 (41) 99708-5707                                             */
/* Email: danielsommer@alunos.utfpr.edu.br                                    */
/* LinkedIn: www.linkedin.com/in/danisommer                                   */
/*============================================================================*/
/* This program removes white spaces from a given string.                     */
/*============================================================================*/

public class Remove {
    public static void main(String[] args) {
        String text = "texto      de tes te esss     teste e      tes";
        text = removeWhiteSpaces(text);
        System.out.println(text);
    }
    private static String removeWhiteSpaces(String text) {
        StringBuilder res = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c != ' ' && c != '\t') {
                res.append(c);
            }
        }
        return res.toString();
    }
}