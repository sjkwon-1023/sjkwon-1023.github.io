/**
 * <head> 안에서 파서를 막고 동기 실행되는 스크립트. body 파싱 전에 data-theme 을 확정해
 * 첫 페인트부터 올바른 테마가 나오게 한다(= 흰 화면 번쩍임 없음).
 *
 * localStorage 에 값이 없으면 "시스템 설정을 따른다"는 뜻이다. 명시적으로 토글할 때만
 * 키를 쓰므로, 첫 방문 시점의 OS 설정에 사용자를 고정시키지 않는다.
 * Safari 사생활 보호 모드에서 localStorage 접근이 throw 하므로 try/catch 로 감싼다.
 */
export const THEME_SCRIPT = `!function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}}()`;
