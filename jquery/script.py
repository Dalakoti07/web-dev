file=open('sample.txt',"w")
for i in range(0,23):
    # print("file : /images/{}".format(str(i).zfill(2)))
    file.write("\n\n![image](/jquery/images/"+str(i).zfill(2)+".png)")
file.close()