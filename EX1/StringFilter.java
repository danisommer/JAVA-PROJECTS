/*============================================================================*/
/* Strings Filter Program                                                     */
/*----------------------------------------------------------------------------*/
/* Author: Daniel Zaki Sommer                                                 */
/* Github: https://github.com/danisommer                                      */
/* Telephone: +55 (41) 99708-5707                                             */
/* Email: danielsommer@alunos.utfpr.edu.br                                    */
/* LinkedIn: www.linkedin.com/in/danisommer                                   */
/*============================================================================*/
/* This program filters a list of strings to find those starting with 'a' and */
/* having a length of 3.                                                      */
/*============================================================================*/

import java.util.List;
import java.util.stream.Collectors;

public class StringFilter {
    public static List<String> filterStrings(List<String> strings) {
        return strings.stream()
                .filter(s -> s.startsWith("a") && s.length() == 3)
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        List<String> inputStrings = List.of("abc", "defnhy", "aab", "bcag", "aaa", "xyw", "ab", "aewrwe", "aqq", "aaaaaa");
        List<String> filteredStrings = filterStrings(inputStrings);
        System.out.println(filteredStrings);
    }
}